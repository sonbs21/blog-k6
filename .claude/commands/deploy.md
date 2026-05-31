Build the Next.js blog and deploy to AWS (S3 + CloudFront).

Read `.claude/agents/infra.md` for infrastructure context before proceeding.

## Pre-flight Checks

Before running anything, verify:
- [ ] `CLOUDFRONT_DISTRIBUTION_ID` is set in environment or `.env`
- [ ] `S3_BUCKET_NAME` is set in environment or `.env`
- [ ] AWS CLI is authenticated (`aws sts get-caller-identity`)
- [ ] No TypeScript errors: `npm run type-check`
- [ ] No lint errors: `npm run lint`

## Deploy Steps

```bash
# 1. Type check and lint
npm run type-check
npm run lint

# 2. Build and export static files
npm run build
# Outputs to: out/

# 3. Sync to S3
# Immutable assets (JS/CSS have content hashes)
aws s3 sync out/_next/ s3://$S3_BUCKET_NAME/_next/ \
  --delete \
  --cache-control "public,max-age=31536000,immutable"

# HTML and other files (no content hash — shorter cache)
aws s3 sync out/ s3://$S3_BUCKET_NAME/ \
  --delete \
  --exclude "_next/*" \
  --cache-control "public,max-age=0,must-revalidate"

# 4. Invalidate CloudFront cache
aws cloudfront create-invalidation \
  --distribution-id $CLOUDFRONT_DISTRIBUTION_ID \
  --paths "/*"

# 5. Confirm deployment
echo "Deployed. Check: https://$(aws cloudfront get-distribution \
  --id $CLOUDFRONT_DISTRIBUTION_ID \
  --query 'Distribution.DomainName' --output text)"
```

## Terraform Changes (infra only)

If `.tf` files were modified, run separately:

```bash
cd terraform/
terraform fmt
terraform validate
terraform plan -var-file=prod.tfvars   # review output
# terraform apply requires manual confirmation — do not auto-run
```

## Rollback

S3 sync with `--delete` is destructive. To rollback:
1. Revert to the previous git commit
2. Re-run `npm run build`
3. Re-run the S3 sync commands above
4. Invalidate CloudFront again
