# Terraform + AWS Patterns — Travel Blog

Infrastructure conventions for this project.
Apply these automatically when writing or reviewing `.tf` files.

## Provider & Backend

```hcl
# main.tf
terraform {
  required_version = ">= 1.6"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }

  backend "s3" {
    bucket         = "travel-blog-tfstate"
    key            = "prod/terraform.tfstate"
    region         = "ap-southeast-1"
    encrypt        = true
    dynamodb_table = "travel-blog-tflock"
  }
}

provider "aws" {
  region = var.aws_region
  default_tags {
    tags = {
      Project     = "travel-blog"
      Environment = var.environment
      ManagedBy   = "terraform"
    }
  }
}

# Separate provider for ACM — must be us-east-1 for CloudFront
provider "aws" {
  alias  = "us_east_1"
  region = "us-east-1"
}
```

## S3 Bucket — Static Hosting

```hcl
resource "aws_s3_bucket" "site" {
  bucket = "${var.project}-${var.environment}-site"
}

resource "aws_s3_bucket_public_access_block" "site" {
  bucket                  = aws_s3_bucket.site.id
  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

# Bucket policy: allow CloudFront OAC only
resource "aws_s3_bucket_policy" "site" {
  bucket = aws_s3_bucket.site.id
  policy = data.aws_iam_policy_document.site_bucket.json
}

data "aws_iam_policy_document" "site_bucket" {
  statement {
    principals {
      type        = "Service"
      identifiers = ["cloudfront.amazonaws.com"]
    }
    actions   = ["s3:GetObject"]
    resources = ["${aws_s3_bucket.site.arn}/*"]
    condition {
      test     = "StringEquals"
      variable = "AWS:SourceArn"
      values   = [aws_cloudfront_distribution.site.arn]
    }
  }
}
```

## CloudFront Distribution

```hcl
resource "aws_cloudfront_origin_access_control" "site" {
  name                              = "${var.project}-${var.environment}-oac"
  origin_access_control_origin_type = "s3"
  signing_behavior                  = "always"
  signing_protocol                  = "sigv4"
}

resource "aws_cloudfront_distribution" "site" {
  enabled             = true
  default_root_object = "index.html"
  aliases             = [var.domain_name]

  origin {
    domain_name              = aws_s3_bucket.site.bucket_regional_domain_name
    origin_id                = "s3-origin"
    origin_access_control_id = aws_cloudfront_origin_access_control.site.id
  }

  default_cache_behavior {
    target_origin_id       = "s3-origin"
    viewer_protocol_policy = "redirect-to-https"
    allowed_methods        = ["GET", "HEAD"]
    cached_methods         = ["GET", "HEAD"]
    compress               = true

    forwarded_values {
      query_string = false
      cookies { forward = "none" }
    }
  }

  # SPA fallback — serve index.html on 403/404
  custom_error_response {
    error_code         = 403
    response_code      = 200
    response_page_path = "/index.html"
  }
  custom_error_response {
    error_code         = 404
    response_code      = 200
    response_page_path = "/404.html"
  }

  viewer_certificate {
    acm_certificate_arn      = aws_acm_certificate_validation.site.certificate_arn
    ssl_support_method       = "sni-only"
    minimum_protocol_version = "TLSv1.2_2021"
  }

  restrictions {
    geo_restriction { restriction_type = "none" }
  }
}
```

## ACM Certificate

```hcl
resource "aws_acm_certificate" "site" {
  provider          = aws.us_east_1   # CloudFront requires us-east-1
  domain_name       = var.domain_name
  validation_method = "DNS"

  lifecycle {
    create_before_destroy = true
  }
}

resource "aws_route53_record" "cert_validation" {
  for_each = {
    for dvo in aws_acm_certificate.site.domain_validation_options : dvo.domain_name => dvo
  }
  zone_id = data.aws_route53_zone.site.zone_id
  name    = each.value.resource_record_name
  type    = each.value.resource_record_type
  records = [each.value.resource_record_value]
  ttl     = 60
}

resource "aws_acm_certificate_validation" "site" {
  provider                = aws.us_east_1
  certificate_arn         = aws_acm_certificate.site.arn
  validation_record_fqdns = [for r in aws_route53_record.cert_validation : r.fqdn]
}
```

## Naming Convention

| Resource | Pattern | Example |
|---|---|---|
| S3 bucket | `{project}-{env}-{purpose}` | `travel-blog-prod-site` |
| CloudFront | `{project}-{env}-cf` | `travel-blog-prod-cf` |
| IAM role | `{project}-{env}-{service}-role` | `travel-blog-prod-lambda-role` |
| SSM param | `/{project}/{env}/{key}` | `/travel-blog/prod/cf-distribution-id` |

## Variables Template

```hcl
# variables.tf
variable "project"     { default = "travel-blog" }
variable "environment" {}           # prod | staging
variable "aws_region"  { default = "ap-southeast-1" }
variable "domain_name" {}           # e.g. blog.example.com
variable "route53_zone_id" {}
```
