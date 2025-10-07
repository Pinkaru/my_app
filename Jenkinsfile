pipeline {
    agent {
        docker {
            image 'node:18-alpine'
            args '-v /var/run/docker.sock:/var/run/docker.sock'
        }
    }

    environment {
        NODE_ENV = 'test'
        MONGODB_URI = 'mongodb://localhost:27017/myapp_test'
        HOME = "${WORKSPACE}"
        npm_config_cache = "${WORKSPACE}/.npm"
    }

    stages {
        stage('📋 Checkout') {
            steps {
                echo '🎉 Jenkins CI/CD Pipeline Started!'
                echo "Build Number: ${env.BUILD_NUMBER}"
                echo "Branch: ${env.GIT_BRANCH}"
                echo "Commit: ${env.GIT_COMMIT}"
            }
        }

        stage('🔧 Setup') {
            steps {
                echo '📦 Installing dependencies...'
                sh 'node --version'
                sh 'npm --version'
                sh 'npm ci'
            }
        }

        stage('🔍 Lint') {
            steps {
                echo '🔍 Running ESLint...'
                sh 'npm run lint'
            }
        }

        stage('🧪 Test') {
            steps {
                echo '🧪 Running tests...'
                sh 'npm run test:coverage'
            }
            post {
                always {
                    echo '📊 Publishing test results...'
                    // Archive test coverage reports
                    publishHTML([
                        allowMissing: false,
                        alwaysLinkToLastBuild: true,
                        keepAll: true,
                        reportDir: 'coverage/lcov-report',
                        reportFiles: 'index.html',
                        reportName: 'Test Coverage Report',
                        reportTitles: 'Coverage'
                    ])
                }
            }
        }

        stage('🏗️ Build') {
            steps {
                echo '🏗️ Running build checks...'
                sh 'npm run build'
            }
        }

        stage('📦 Package') {
            steps {
                echo '📦 Creating deployment package...'
                sh '''
                    mkdir -p dist
                    tar -czf dist/myapp-${BUILD_NUMBER}.tar.gz \
                        --exclude=node_modules \
                        --exclude=.git \
                        --exclude=dist \
                        --exclude=coverage \
                        --exclude=__tests__ \
                        .
                '''
            }
        }
    }

    post {
        success {
            echo '✅ Pipeline completed successfully!'
            echo '📊 Archiving build artifacts...'
            archiveArtifacts artifacts: 'dist/*.tar.gz', fingerprint: true
        }
        failure {
            echo '❌ Pipeline failed!'
        }
        always {
            echo '🧹 Cleaning up workspace...'
            cleanWs(
                deleteDirs: true,
                patterns: [
                    [pattern: 'node_modules', type: 'INCLUDE'],
                    [pattern: 'coverage', type: 'INCLUDE']
                ]
            )
        }
    }
}
