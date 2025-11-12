module.exports = {
  default: {
    require: ['features/step_definitions/**/*.js', 'features/support/**/*.js'],
    format: [
      'progress-bar',
      'html:reports/cucumber-report.html',
      'json:reports/cucumber-report.json',
    ],
    formatOptions: {
      snippetInterface: 'async-await',
    },
    parallel: 2, // Run up to 2 scenarios in parallel (reduced from 3)
    publishQuiet: true,
    timeout: 30000, // Increase timeout to 30 seconds
  },
};
