pipeline {
    agent any

    environment {
        NODE_VERSION = '18'
        MONGODB_URI = 'mongodb://localhost:27017/myapp_test'
        NODE_ENV = 'test'
        DOCKER_COMPOSE_FILE = 'docker-compose.test.yml'
    }

    stages {
        stage('Checkout') {
            steps {
                echo '📦 Checking out source code...'
                checkout scm
            }
        }

        stage('Setup') {
            steps {
                echo '🔧 Setting up Node.js environment...'
                sh 'node --version'
                sh 'npm --version'

                echo '📥 Installing dependencies...'
                sh 'npm ci'
            }
        }

        stage('Lint') {
            steps {
                echo '🔍 Running code quality checks...'
                script {
                    try {
                        sh 'npm run lint'
                        echo '✅ Lint passed'
                    } catch (Exception e) {
                        echo '⚠️  Lint failed - please fix linting errors'
                        currentBuild.result = 'UNSTABLE'
                    }
                }
            }
        }

        stage('Format Check') {
            steps {
                echo '✨ Checking code formatting...'
                script {
                    try {
                        sh 'npm run format:check'
                        echo '✅ Format check passed'
                    } catch (Exception e) {
                        echo '⚠️  Format check failed - run npm run format to fix'
                        currentBuild.result = 'UNSTABLE'
                    }
                }
            }
        }

        stage('Start Test Database') {
            steps {
                echo '🐳 Starting MongoDB test container...'
                sh """
                    docker-compose -f ${DOCKER_COMPOSE_FILE} down -v || true
                    docker-compose -f ${DOCKER_COMPOSE_FILE} up -d
                    sleep 10
                """

                echo '⏳ Waiting for MongoDB to be ready...'
                script {
                    retry(5) {
                        sleep 2
                        sh 'docker-compose -f ${DOCKER_COMPOSE_FILE} ps'
                    }
                }
            }
        }

        stage('Unit Tests') {
            steps {
                echo '🧪 Running unit tests...'
                sh 'npm run test:unit'
            }
        }

        stage('Integration Tests') {
            steps {
                echo '🔗 Running integration tests...'
                sh 'npm run test:integration'
            }
        }

        stage('Test Coverage') {
            steps {
                echo '📊 Generating test coverage report...'
                sh 'npm run test:coverage'
            }
        }

        stage('Build') {
            steps {
                echo '🏗️  Building application...'
                sh 'npm prune --production'
                sh 'npm install --production'
            }
        }

        stage('Archive Artifacts') {
            steps {
                echo '📦 Archiving build artifacts...'
                archiveArtifacts artifacts: 'package.json,app.js,views/**,public/**', fingerprint: true
            }
        }
    }

    post {
        always {
            echo '🧹 Cleaning up...'
            sh """
                docker-compose -f ${DOCKER_COMPOSE_FILE} down -v || true
            """

            // Publish test results if they exist
            script {
                if (fileExists('coverage')) {
                    publishHTML([
                        allowMissing: false,
                        alwaysLinkToLastBuild: true,
                        keepAll: true,
                        reportDir: 'coverage/lcov-report',
                        reportFiles: 'index.html',
                        reportName: 'Coverage Report'
                    ])
                }
            }

            cleanWs()
        }

        success {
            echo '✅ Build succeeded!'
            echo "Build #${env.BUILD_NUMBER} completed successfully"

            // Update GitHub commit status
            script {
                try {
                    sh """
                        curl -X POST \
                        -H "Accept: application/vnd.github+json" \
                        -H "Authorization: Bearer \${GITHUB_TOKEN}" \
                        https://api.github.com/repos/\${GIT_REPOSITORY}/statuses/\${GIT_COMMIT} \
                        -d '{"state":"success","context":"Jenkins CI","description":"Build passed"}'
                    """
                } catch (Exception e) {
                    echo "Could not update GitHub status: ${e.message}"
                }
            }
        }

        failure {
            echo '❌ Build failed!'
            echo "Build #${env.BUILD_NUMBER} failed"

            // Update GitHub commit status
            script {
                try {
                    sh """
                        curl -X POST \
                        -H "Accept: application/vnd.github+json" \
                        -H "Authorization: Bearer \${GITHUB_TOKEN}" \
                        https://api.github.com/repos/\${GIT_REPOSITORY}/statuses/\${GIT_COMMIT} \
                        -d '{"state":"failure","context":"Jenkins CI","description":"Build failed"}'
                    """
                } catch (Exception e) {
                    echo "Could not update GitHub status: ${e.message}"
                }
            }
        }

        unstable {
            echo '⚠️  Build is unstable'
            echo "Build #${env.BUILD_NUMBER} completed with warnings"
        }
    }
}
