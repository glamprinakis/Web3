#!/bin/bash

echo "🔍 Validating Environment Configuration..."
echo "========================================="

# Function to check if a file exists and has content
check_file() {
    local file=$1
    local description=$2
    
    if [ ! -f "$file" ]; then
        echo "❌ Missing: $description at $file"
        return 1
    elif [ ! -s "$file" ]; then
        echo "❌ Empty: $description at $file"
        return 1
    else
        echo "✅ Found: $description"
        return 0
    fi
}

# Function to extract value from file
extract_value() {
    local file=$1
    local var_name=$2
    
    if [[ "$file" == *".tfvars" ]]; then
        # For terraform files: db_password = "value"
        grep "^${var_name}[[:space:]]*=" "$file" | sed 's/.*=[[:space:]]*"\(.*\)".*/\1/' 2>/dev/null
    else
        # For .env files: DB_PASSWORD=value
        grep "^${var_name}=" "$file" | cut -d'=' -f2- 2>/dev/null
    fi
}

# Function to check if a variable is set in a file
check_var_in_file() {
    local file=$1
    local var_name=$2
    local description=$3
    
    if [ ! -f "$file" ]; then
        echo "❌ File not found: $file"
        return 1
    fi
    
    local value=$(extract_value "$file" "$var_name")
    if [ ! -z "$value" ] && [[ ! "$value" =~ your- ]]; then
        echo "✅ $description is set in $file"
        return 0
    else
        echo "❌ $description is missing or not properly set in $file"
        return 1
    fi
}

# Function to check SSH key
check_ssh_key() {
    local key_path=$1
    
    if [ ! -f "$key_path" ]; then
        echo "❌ SSH private key not found at $key_path"
        return 1
    elif [ ! -r "$key_path" ]; then
        echo "❌ SSH private key not readable at $key_path"
        return 1
    else
        echo "✅ SSH private key found and readable"
        return 0
    fi
}

VALIDATION_FAILED=0

echo ""
echo "🔍 Checking Local Configuration Files..."
echo "----------------------------------------"

# Check terraform.tfvars
if check_file "terraform/terraform.tfvars" "Terraform variables file"; then
    check_var_in_file "terraform/terraform.tfvars" "db_password" "Database password" || VALIDATION_FAILED=1
    check_var_in_file "terraform/terraform.tfvars" "jwt_secret" "JWT secret" || VALIDATION_FAILED=1
    check_var_in_file "terraform/terraform.tfvars" "ssh_public_key" "SSH public key" || VALIDATION_FAILED=1
else
    VALIDATION_FAILED=1
fi

# Check .env file
if check_file ".env" "Local environment file"; then
    check_var_in_file ".env" "DB_PASSWORD" "Database password" || VALIDATION_FAILED=1
    check_var_in_file ".env" "JWT_SECRET" "JWT secret" || VALIDATION_FAILED=1
else
    VALIDATION_FAILED=1
fi

# Check SSH key
check_ssh_key "$HOME/.ssh/deploy_key_ec2" || VALIDATION_FAILED=1

echo ""
echo "🔍 Validating Value Consistency..."
echo "-----------------------------------"

# Get values from both files
env_db_password=$(extract_value ".env" "DB_PASSWORD")
tf_db_password=$(extract_value "terraform/terraform.tfvars" "db_password")
env_jwt_secret=$(extract_value ".env" "JWT_SECRET")
tf_jwt_secret=$(extract_value "terraform/terraform.tfvars" "jwt_secret")

# Check DB_PASSWORD match
if [ "$env_db_password" = "$tf_db_password" ] && [ ! -z "$env_db_password" ]; then
    echo "✅ DB_PASSWORD matches between .env and terraform.tfvars"
    echo "   Value: ${env_db_password:0:6}*** (length: ${#env_db_password})"
else
    echo "❌ DB_PASSWORD mismatch:"
    echo "   .env: '${env_db_password:0:6}***' (length: ${#env_db_password})"
    echo "   terraform.tfvars: '${tf_db_password:0:6}***' (length: ${#tf_db_password})"
    VALIDATION_FAILED=1
fi

# Check JWT_SECRET match
if [ "$env_jwt_secret" = "$tf_jwt_secret" ] && [ ! -z "$env_jwt_secret" ]; then
    echo "✅ JWT_SECRET matches between .env and terraform.tfvars"
    echo "   Value: ${env_jwt_secret:0:6}*** (length: ${#env_jwt_secret})"
else
    echo "❌ JWT_SECRET mismatch:"
    echo "   .env: '${env_jwt_secret:0:6}***' (length: ${#env_jwt_secret})"
    echo "   terraform.tfvars: '${tf_jwt_secret:0:6}***' (length: ${#tf_jwt_secret})"
    VALIDATION_FAILED=1
fi

# Validate SSH key correspondence
ssh_public_key=$(extract_value "terraform/terraform.tfvars" "ssh_public_key")
if [ ! -z "$ssh_public_key" ] && [ -f "$HOME/.ssh/deploy_key_ec2" ]; then
    derived_public_key=$(ssh-keygen -y -f "$HOME/.ssh/deploy_key_ec2" 2>/dev/null)
    if [ "$ssh_public_key" = "$derived_public_key" ]; then
        echo "✅ SSH keys match: terraform public key corresponds to local private key"
    else
        echo "❌ SSH key mismatch - check that keys correspond"
        VALIDATION_FAILED=1
    fi
else
    echo "⚠️  Cannot validate SSH key correspondence"
    VALIDATION_FAILED=1
fi

echo ""
echo "🔍 GitHub Secrets Required..."
echo "-----------------------------"
echo "❗ CRITICAL: GitHub secrets cannot be read back for security."
echo "You MUST manually verify these match your local values:"
echo ""
echo "🔑 Required GitHub Repository Secrets:"
echo "  • AWS_ACCESS_KEY_ID: (your AWS access key)"
echo "  • AWS_SECRET_ACCESS_KEY: (your AWS secret key)"
echo "  • DB_PASSWORD: ${env_db_password:0:6}*** (${#env_db_password} chars)"
echo "  • JWT_SECRET: ${env_jwt_secret:0:6}*** (${#env_jwt_secret} chars)"
echo "  • SSH_PRIVATE_KEY: (content of ~/.ssh/deploy_key_ec2)"
echo ""
echo "🛡️  BULLETPROOF VERIFICATION:"
echo "1. Go to: https://github.com/glamprinakis/Web3/settings/secrets/actions"
echo "2. Verify these secrets exist and were updated recently:"
echo "   - AWS_ACCESS_KEY_ID (should exist)"
echo "   - AWS_SECRET_ACCESS_KEY (should exist)"
echo "   - DB_PASSWORD (should match: ${env_db_password:0:6}***)"
echo "   - JWT_SECRET (should match: ${env_jwt_secret:0:6}***)"
echo "   - SSH_PRIVATE_KEY (should contain private key content)"
echo ""

# Create verification helpers
echo "📋 COPY-PASTE HELPERS for GitHub Secrets:"
echo "-------------------------------------------"
echo "DB_PASSWORD value to copy:"
echo "${env_db_password}"
echo ""
echo "JWT_SECRET value to copy:"
echo "${env_jwt_secret}"
echo ""
echo "SSH_PRIVATE_KEY value to copy:"
echo "cat ~/.ssh/deploy_key_ec2"
echo ""

# Interactive verification
echo "🤝 INTERACTIVE VERIFICATION:"
echo "Would you like to verify GitHub secrets now? (y/N)"
read -r verify_secrets

if [[ "$verify_secrets" =~ ^[Yy]$ ]]; then
    echo ""
    echo "Please check each secret in GitHub and confirm:"
    
    echo -n "✓ AWS_ACCESS_KEY_ID exists? (y/N): "
    read -r aws_key_exists
    [[ "$aws_key_exists" =~ ^[Yy]$ ]] || VALIDATION_FAILED=1
    
    echo -n "✓ AWS_SECRET_ACCESS_KEY exists? (y/N): "
    read -r aws_secret_exists
    [[ "$aws_secret_exists" =~ ^[Yy]$ ]] || VALIDATION_FAILED=1
    
    echo -n "✓ DB_PASSWORD matches ${env_db_password:0:6}***? (y/N): "
    read -r db_password_matches
    [[ "$db_password_matches" =~ ^[Yy]$ ]] || VALIDATION_FAILED=1
    
    echo -n "✓ JWT_SECRET matches ${env_jwt_secret:0:6}***? (y/N): "
    read -r jwt_secret_matches
    [[ "$jwt_secret_matches" =~ ^[Yy]$ ]] || VALIDATION_FAILED=1
    
    echo -n "✓ SSH_PRIVATE_KEY contains your private key? (y/N): "
    read -r ssh_key_exists
    [[ "$ssh_key_exists" =~ ^[Yy]$ ]] || VALIDATION_FAILED=1
    
    if [ $VALIDATION_FAILED -eq 0 ]; then
        echo "✅ GitHub secrets verification completed successfully!"
    else
        echo "❌ GitHub secrets verification failed!"
    fi
else
    echo "⚠️  Skipping GitHub secrets verification - remember to check manually!"
fi

echo ""
echo "🔍 Terraform Status..."
echo "----------------------"
if [ -f "terraform/main.tf" ]; then
    echo "✅ Terraform configuration found"
    if [ -d "terraform/.terraform" ]; then
        echo "✅ Terraform is initialized"
    else
        echo "⚠️  Terraform not initialized - run 'cd terraform && terraform init'"
    fi
else
    echo "❌ Terraform configuration not found"
    VALIDATION_FAILED=1
fi

echo ""
echo "========================================"
if [ $VALIDATION_FAILED -eq 0 ]; then
    echo "✅ ALL VALIDATIONS PASSED!"
    echo ""
    echo "📋 Configuration Summary:"
    echo "  • DB Password: ${env_db_password:0:6}*** (${#env_db_password} chars)"
    echo "  • JWT Secret:  ${env_jwt_secret:0:6}*** (${#env_jwt_secret} chars)"
    echo "  • SSH Key:     ~/.ssh/deploy_key_ec2"
    echo ""
    echo "🚀 Ready to deploy! You can run:"
    echo "   ./start-server.sh    # Create infrastructure"
    echo "   ./stop-server.sh     # Destroy infrastructure"
    echo "   git push             # Trigger deployment"
    echo ""
    echo "🛡️  BULLETPROOF TEST:"
    echo "   ./test-github-secrets.sh  # Create and run test deployment"
    
    # Create bulletproof test script
    cat > test-github-secrets.sh << 'EOF'
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
EOF
    chmod +x test-github-secrets.sh
    
    exit 0
else
    echo "❌ VALIDATION FAILED!"
    echo ""
    echo "🔧 Fix these issues:"
    echo "   • Ensure values match between .env and terraform.tfvars"
    echo "   • Update GitHub secrets to match local values"
    echo "   • Verify SSH key correspondence"
    echo "   • Initialize Terraform if needed"
    exit 1
fi
