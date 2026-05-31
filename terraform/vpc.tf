resource "aws_vpc" "main" {
  cidr_block           = var.vpc_cidr
  enable_dns_hostnames = true
  enable_dns_support   = true
  tags                 = { Name = "${local.name_prefix}-vpc" }
}

# Public subnets (frontend EC2 + NAT GW)
resource "aws_subnet" "public" {
  count                   = 2
  vpc_id                  = aws_vpc.main.id
  cidr_block              = var.public_subnet_cidrs[count.index]
  availability_zone       = local.azs[count.index]
  map_public_ip_on_launch = true
  tags                    = { Name = "${local.name_prefix}-public-${count.index + 1}" }
}

# Private subnets for backend ASG
resource "aws_subnet" "private_backend" {
  count             = 2
  vpc_id            = aws_vpc.main.id
  cidr_block        = var.private_backend_cidrs[count.index]
  availability_zone = local.azs[count.index]
  tags              = { Name = "${local.name_prefix}-private-backend-${count.index + 1}" }
}

# Private subnets for RDS
resource "aws_subnet" "private_rds" {
  count             = 2
  vpc_id            = aws_vpc.main.id
  cidr_block        = var.private_rds_cidrs[count.index]
  availability_zone = local.azs[count.index]
  tags              = { Name = "${local.name_prefix}-private-rds-${count.index + 1}" }
}

# Internet Gateway
resource "aws_internet_gateway" "main" {
  vpc_id = aws_vpc.main.id
  tags   = { Name = "${local.name_prefix}-igw" }
}

# Elastic IPs for NAT Gateways
resource "aws_eip" "nat" {
  count  = 2
  domain = "vpc"
  tags   = { Name = "${local.name_prefix}-nat-eip-${count.index + 1}" }
}

# NAT Gateways (1 per AZ for HA)
resource "aws_nat_gateway" "main" {
  count         = 2
  allocation_id = aws_eip.nat[count.index].id
  subnet_id     = aws_subnet.public[count.index].id
  tags          = { Name = "${local.name_prefix}-nat-${count.index + 1}" }
  depends_on    = [aws_internet_gateway.main]
}

# Public route table
resource "aws_route_table" "public" {
  vpc_id = aws_vpc.main.id
  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.main.id
  }
  tags = { Name = "${local.name_prefix}-public-rt" }
}

resource "aws_route_table_association" "public" {
  count          = 2
  subnet_id      = aws_subnet.public[count.index].id
  route_table_id = aws_route_table.public.id
}

# Private route tables (one per AZ — each uses its AZ's NAT GW)
resource "aws_route_table" "private" {
  count  = 2
  vpc_id = aws_vpc.main.id
  route {
    cidr_block     = "0.0.0.0/0"
    nat_gateway_id = aws_nat_gateway.main[count.index].id
  }
  tags = { Name = "${local.name_prefix}-private-rt-${count.index + 1}" }
}

resource "aws_route_table_association" "private_backend" {
  count          = 2
  subnet_id      = aws_subnet.private_backend[count.index].id
  route_table_id = aws_route_table.private[count.index].id
}

resource "aws_route_table_association" "private_rds" {
  count          = 2
  subnet_id      = aws_subnet.private_rds[count.index].id
  route_table_id = aws_route_table.private[count.index].id
}
