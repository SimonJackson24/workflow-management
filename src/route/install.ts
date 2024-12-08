import express from 'express';
import { systemCheck, DatabaseConfig, SystemRequirements } from '../utils/systemCheck';
import { initializeDatabase, runMigrations, testConnection } from '../utils/database';
import { createAdminUser, generateSecretKey } from '../utils/auth';
import { ConfigManager } from '../utils/configManager';
import { Logger } from '../utils/logger';
import { BackupService } from '../utils/backup';
import path from 'path';
import fs from 'fs-extra';

const router = express.Router();
const logger = new Logger('InstallationWizard');
const INSTALL_LOCK_FILE = path.join(__dirname, '../../.install.lock');

interface InstallationState {
  step: number;
  completed: string[];
  config: Record<string, any>;
}

// Session-based state management
const getState = (req: express.Request): InstallationState => {
  return req.session.installState || {
    step: 1,
    completed: [],
    config: {}
  };
};

// Installation status middleware
const installationGuard = async (req: express.Response, res: express.Response, next: express.NextFunction) => {
  try {
    if (await isInstalled() && !req.path.includes('/upgrade')) {
      return res.redirect('/');
    }
    next();
  } catch (error) {
    logger.error('Installation guard error:', error);
    next(error);
  }
};

// Pre-installation checks
router.get('/check', installationGuard, async (req, res) => {
  try {
    const requirements: SystemRequirements = await systemCheck();
    const state = getState(req);
    
    res.render('install/check', {
      requirements,
      allPassed: Object.values(requirements).every(r => r.passed),
      state
    });
  } catch (error) {
    logger.error('Pre-installation check failed:', error);
    res.render('install/error', { error });
  }
});

// Database configuration
router.post('/database', installationGuard, async (req, res) => {
  try {
    const dbConfig: DatabaseConfig = {
      host: req.body.dbHost,
      port: parseInt(req.body.dbPort),
      user: req.body.dbUser,
      password: req.body.dbPassword,
      database: req.body.dbName,
      ssl: req.body.dbSsl === 'true'
    };

    // Test connection
    const connectionTest = await testConnection(dbConfig);
    if (!connectionTest.success) {
      return res.status(400).json({
        success: false,
        error: connectionTest.error
      });
    }

    // Initialize database and run migrations
    await initializeDatabase(dbConfig);
    await runMigrations();

    // Update installation state
    const state = getState(req);
    state.completed.push('database');
    state.config.database = dbConfig;
    req.session.installState = state;

    res.json({ success: true });
  } catch (error) {
    logger.error('Database configuration failed:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Admin user setup
router.post('/admin', installationGuard, async (req, res) => {
  try {
    const { email, password, confirmPassword, firstName, lastName } = req.body;

    if (password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        error: 'Passwords do not match'
      });
    }

    await createAdminUser({
      email,
      password,
      firstName,
      lastName
    });

    const state = getState(req);
    state.completed.push('admin');
    req.session.installState = state;

    res.json({ success: true });
  } catch (error) {
    logger.error('Admin user creation failed:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// System configuration
router.post('/config', installationGuard, async (req, res) => {
  try {
    const config = {
      siteName: req.body.siteName,
      siteUrl: req.body.siteUrl,
      emailSettings: {
        smtp: req.body.smtpServer,
        port: parseInt(req.body.smtpPort),
        user: req.body.smtpUser,
        password: req.body.smtpPassword,
        secure: req.body.smtpSecure === 'true'
      },
      secretKey: generateSecretKey(),
      installDate: new Date().toISOString()
    };

    // Save configuration
    const configManager = new ConfigManager();
    await configManager.saveConfig(config);

    const state = getState(req);
    state.completed.push('config');
    state.config.system = config;
    req.session.installState = state;

    res.json({ success: true });
  } catch (error) {
    logger.error('System configuration failed:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Finalize installation
router.post('/finalize', installationGuard, async (req, res) => {
  try {
    const state = getState(req);
    
    // Create necessary directories
    const dirs = ['uploads', 'temp', 'logs', 'backups'];
    for (const dir of dirs) {
      await fs.ensureDir(path.join(__dirname, `../../${dir}`));
    }

    // Create backup of initial state
    const backupService = new BackupService();
    await backupService.createBackup('initial');

    // Create installation lock file
    await fs.writeFile(INSTALL_LOCK_FILE, JSON.stringify({
      date: new Date().toISOString(),
      version: process.env.APP_VERSION || '1.0.0'
    }));

    // Clear installation state
    req.session.installState = null;

    res.json({ success: true });
  } catch (error) {
    logger.error('Installation finalization failed:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// System upgrade route
router.post('/upgrade', async (req, res) => {
  try {
    // Verify admin credentials before upgrade
    // ... authentication logic ...

    // Backup current system
    const backupService = new BackupService();
    await backupService.createBackup('pre-upgrade');

    // Run upgrade scripts
    await runMigrations();

    res.json({ success: true });
  } catch (error) {
    logger.error('System upgrade failed:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});
