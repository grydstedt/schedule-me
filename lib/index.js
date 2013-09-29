/**
 * Super simple scheduler with cron, timeout, and date support.
 *
 * @package schedule-me
 * @author Gustav Rydstedt <gustav.rydstedt@gmail.com>
 */

var cron = require('cron');

var ScheduleMe, ScheduleMeJob;

module.exports = ScheduleMe;

/**
 * ScheduleMe Constructor
 */
function ScheduleMe(options) {

  this.options = options || {};

  this.logger = this.options.logger || console;

  // Job array
  this.jobs = [];

  this.started = false;
};

/**
 * Start running jobs
 */
ScheduleMe.prototype.start = function() {
  this.logger.log('Starting scheduler');

  if(this.started) throw new Error('Scheduler is already started');

  this.jobs.forEach(function(job) {
    job.start();
  });

  this.started = true;
};

/**
 * Stop running all jobs
 */
ScheduleMe.prototype.stop = function() {
  this.logger.log('Stopping scheduler');

  this.jobs.forEach(function(job) {
    job.stop();
  });

  this.started = false;
};

/**
 * Schedule a job
 */
ScheduleMe.prototype.schedule = function(func, when, name) {

  var options;

  if(typeof(func) === 'object') {
    options = func;
  } else {
    options =     
    {
      job: func,
      when: when,
      name: name || 'Unknown',
      logger: this.logger
    }
  }

  var job = new ScheduleMeJob(options);

  this.jobs.push(job);

  return job;
};

/**
 * Schedule multiple jobs
 */
ScheduleMe.prototype.scheduleAll = function(jobs) {
  var _this = this;

  if(jobs.job) {
    // Just one
    return _this.schedule(jobs);
  }

  // Array

  jobs.forEach(function(j) {
    // Allow for array of arrays of job
    if(typeof(j) == 'array') {
      j.forEach(function(j2) {
        _this.schedule(j);
      });
    } else {
      _this.schedule(j);
    }
  });

  return this.jobs;
};

/**
 * ScheduleMeJob Constructor
 */
function ScheduleMeJob(options) {

  this.options = options || {};

  this.logger = this.options.logger || console;
 
  this.job = this.options.job;

  if(!this.job) throw new Error('No job given');

  this.when = this.options.when;

  if(!this.when) throw new Error('No "when" given');

  this.name = this.options.name || 'Unknown';

};

/**
 * Start running job
 */
ScheduleMeJob.prototype.start = function() {

  if(this.options.immediate) this.job();

  if(typeof(this.when) == 'string') {
    this.logger.log('Scheduling cron job [%s] with setting %s', this.name, this.when);
    // Cron job
    this.cronJob = new cron.CronJob(this.when, this.job, null, true);
  }

  if(typeof(this.when) == 'number') {
    this.logger.log('Scheduling interval job [%s] with interval %s', this.name, this.when);
    // Interval
    this.interval = setInterval(this.job, this.when);
  }

  if(this.when.getMonth) {
    this.logger.log('Scheduling date job [%s] with date %s', this.name, this.when);
    var msUntilDate = (this.when - new Date());
    if(msUntilDate < 0) {
      throw new Error('Job is in the past ' + this.when)
    }
    // Execute on date
    this.dateTimeout = setTimeout(this.job, msUntilDate);
  }

};

/**
 * Stop running job
 */
ScheduleMeJob.prototype.stop = function() {

  if(typeof(this.when) == 'string') {
    // Cron job
    this.cronJob.stop();
  }

  if(typeof(this.when) == 'number') {
    // Interval
    clearInterval(this.interval);
  }

  if(this.when.getMonth) {
    // Date
    clearTimeout(this.dateTimeout)
  }

};
