pipeline {
    agent any

    options {
        timestamps()
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Run Tests') {
            steps {
                sh '''
                    docker run --rm \
                    -v "$PWD":/app \
                    -w /app \
                    node:24-alpine \
                    sh -c "npm install && npm test"
                '''
            }
        }

        stage('Build Docker Image') {
            steps {
                sh '''
                    docker build -t ping-pong-devops:latest .
                '''
            }
        }

        stage('Deploy Container') {
            steps {
                sh '''
                    docker rm -f ping-pong-app || true

                    docker run -d \
                    --name ping-pong-app \
                    --restart unless-stopped \
                    -p 5000:5000 \
                    ping-pong-devops:latest
                '''
            }
        }
    }

    post {
        success {
            echo 'Deployment successful. App should be running on http://192.168.10.158:5000'
        }

        failure {
            echo 'Pipeline failed. Check the Jenkins console output.'
        }
    }
}