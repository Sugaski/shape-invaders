let aimAngle = 0;
let bullets = [];
let enemies = [];
let particles = [];
let score = 0;
let highScore = parseInt(localStorage.getItem('highScore')) || 0;
let lives = 3;
let lastExtraLife = 0;
let playerInvulnerable = false;
let playerBlinkInterval;
let stageOneBosses = [];
let powerups = [];
let currentPowerup = null;
let powerupEndTime = 0;
let projectilesDestroyed = 0;
let isGameRunning = false;
let animationFrameId = null;
let playerName = '';
let topPlayers = [];
let highScoreName = localStorage.getItem('highScoreName') || '';
let gameState = 'menu';
let isPaused = false;
let pausedPowerups = [];
let powerupsPausedTime = 0;
let lastMousePosition = { x: 0, y: 0 };
let currentEnemySpawnChance = INITIAL_ENEMY_SPAWN_CHANCE;
let lastFireTime = 0;

const fireInterval = 200;
const keys = {};
const menuScreen = document.getElementById('menuScreen');
const gameCanvas = document.getElementById('gameCanvas');
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const BIG_BOSS_SPAWN_INTERVAL = 5; 
const STAGE_ONE_BOSS_SPAWN_INTERVAL = 500;
const INITIAL_ENEMY_SPAWN_CHANCE = 0.02;
const POWERUP_DURATION = 20000; // 20 seconds
const POWERUP_FLASH_DURATION = 5000;
const MAX_ENEMIES = 15;
const MOBILE_SPEED_MULTIPLIER = .5;

const player = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    size: 35,
    speed: 200,
    dx: 0,
    dy: 0,
    angle: 0
};

const ColorScheme = {
    dark: {
        text: '#0f0',
        background: '#000',
        colors: ['#4FAF44', '#F6EB14', '#FF9526', '#EF4423', '#2A3492']
    },
    light: {
        text: '#0d2140',
        background: '#FAF9F6',
        colors: ['#a0eba8', '#f53141', '#f2621f', '#FFC300', '#ae88e3']
    },
    colorblind: {
        text: '#009e73',
        background: '#000',
        colors: ['#d55e00', '#cc79a7', '#0072b2', '#f0e442', '#009e73']
    },
    current: 'dark',
    getTextColor: function() {
        return this[this.current].text;
    },
    getBackgroundColor: function() {
        return this[this.current].background;
    },
    getRandomColor: function() {
        const currentColors = this[this.current].colors;
        return currentColors[Math.floor(Math.random() * currentColors.length)];
    }
};