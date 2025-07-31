#!/bin/bash
echo "🧪 Testing GitHub Secrets Integration..."
echo "======================================="

echo "This test will:"
echo "1. Create a test commit"
echo "2. Push to GitHub to trigger the workflow"
echo "3. Check if the workflow succeeds"
echo "4. Validate that secrets are working correctly"
echo ""

echo "⚠️  WARNING: This will trigger a real deployment!"
echo "Make sure your server is running before proceeding."
echo ""
echo "Continue? (y/N)"
read -r continue_test

if [[ ! "$continue_test" =~ ^[Yy]$ ]]; then
    echo "Test cancelled."
    exit 0
fi

echo ""
echo "🔍 Creating test commit..."
echo "# Test commit to validate GitHub secrets - $(date)" >> .github-secrets-test
git add .github-secrets-test

echo "📤 Pushing test commit..."
git commit -m "Test GitHub secrets integration - $(date '+%Y-%m-%d %H:%M:%S')"
git push

echo ""
echo "✅ Test commit pushed!"
echo "🔍 Check GitHub Actions at:"
echo "   https://github.com/glamprinakis/Web3/actions"
echo ""
echo "If the workflow succeeds, your GitHub secrets are correctly configured!"
echo "If it fails, check the workflow logs for secret-related errors."
echo ""
echo "🧹 Cleanup test file..."
rm -f .github-secrets-test
git add .github-secrets-test
git commit -m "Cleanup: Remove GitHub secrets test file" || true
git push || true
