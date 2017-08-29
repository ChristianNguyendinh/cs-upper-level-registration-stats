node {
	stage('Prep') {
		sh 'rm -rf ./cs-upper-level-registration-stats/'
	}
	stage('Checkout') {
		sh 'git --version'
		sh 'git clone https://github.com/ChristianNguyendinh/cs-upper-level-registration-stats.git'
	}
	dir ('./cs-upper-level-registration-stats/') {
		stage('Install') {
			sh 'npm --version'
			sh 'npm install'
		}
		stage('Unit Tests') {
			sh 'npm run xmltest'
			junit 'test/test-results.xml'
		}
	}
}