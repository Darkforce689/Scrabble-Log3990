export const RACK_LETTER_COUNT = 7;
export const BOARD_DIMENSION = 15;
export const BOARD_MIN_POSITION = 0;
export const BOARD_MAX_POSITION = BOARD_DIMENSION - 1;
export const JOKER_CHAR = '*';
export const EMPTY_CHAR = ' ';
export const CHARACTER_V = 'v';
export const CHARACTER_H = 'h';
export const MIN_PLACE_LETTER_ARG_SIZE = 3;
export const MAX_PLACE_LETTER_ARG_SIZE = 4;
export const TIME_FOR_REVERT = 3000;
export const DEFAULT_TIME_PER_TURN = 60000;
export const MAX_NAME_LENGTH = 30;
export const MIN_NAME_LENGTH = 3;
export const MIN_PASSWORD_LENGTH = 5;
export const MAX_PASSWORD_LENGTH = 32;
export const MAX_CONSECUTIVE_PASS = 6;
export const MAX_NUMBER_OF_PLAYERS = 4;
export const MIN_NUMBER_OF_PLAYERS = 2;
export const DEFAULT_NUMBER_OF_PLAYERS = 4;
export const START_OF_STRING = 0;
export const NOT_FOUND = -1;
export const RESET = 0;
export const ARRAY_BEGIN = 0;
export const FIRST_LETTER_INDEX = 0;
export const MAX_WORD_LENGTH = 15;
export const TIME_BEFORE_PICKING_ACTION = 3000;
export const TIME_BEFORE_PASS = 20000;
export const MIDDLE_OF_BOARD = 7;
export const DEBUG_ALTERNATIVE_WORDS_COUNT = 3;
export const BINGO_MESSAGE = 'Bingo! (50)';
export const BINGO_VALUE = 50;
export const END_LINE = '\\n';
export const TIME_BUFFER_BEFORE_ACTION = 200;
export const MIN_TIME_PER_TURN = 30000;
export const MAX_TIME_PER_TURN = 300000;
export const STEP_TIME_PER_TURN = 30000;
export const DEBUG_MESSAGE_ACTIVATED = 'affichages de débogage activés';
export const DEBUG_MESSAGE_DEACTIVATED = 'affichages de débogage désactivés';
export const RESERVE_NOT_ACCESSIBLE = 'la commande de reserve est uniquement disponible en mode de débogage';
export const HELP =
    '\\n #-Actions-# \\n #!placer <ligne><colonne>(h|v) <mot># \\n Place un mot sur le plateau de jeu.\\n' +
    '#!échanger <x><x><x># où x est une lettre du chevalet à échanger avec la réserve. \\n' +
    '#!passer# \\n Passe le tour. \\n #-Autres-# \\n #!debug# pour activer le mode débogage.\\n' +
    'Affiche les mots alternatifs que le joueur virtuel aurait pu placer.\\n' +
    '#!réserve# (!debug doit être activé)\\n Affiche la fréquence des lettres restantes de la réserve. \\n' +
    '#!aide# \\n Affiche la liste des commandes disponibles.';
export const ERROR_GET_REQUEST_DEBUG = 'Échec de la commande';
export const ASCII_CODE = 65;
export const TIMER_STEP = 100;
export const BACKSPACE = 'Backspace';
export const SPACE = ' ';
export const ESCAPE = 'Escape';
export const ENTER = 'Enter';
export const ARROWRIGHT = 'ArrowRight';
export const ARROWLEFT = 'ArrowLeft';
export const SHIFT = 'Shift';
export const MAX_HIGHSCORE = 5;
export const DEFAULT_DICTIONARY_TITLE = 'Mon dictionnaire';
export const HIGHSCORES_TO_DISPLAY = 5;
export const NOT_ONLY_SPACE_RGX = new RegExp('.*[^ ].*');
export const MAX_FILE_LENGTH = 235;
export const NO_WHITE_SPACE_RGX = /^\S*$/;
export const WAIT_STATUS = 'En attente';
export const ACTIVE_STATUS = 'En cours';
export const PREVIOUS_INDEX = -1;
export const NEXT_INDEX = 1;
export const ALPHABET = 'abcdefghijklmnopqrstuvwxyz'.toUpperCase().split('');

export const BOT_AVATARS = [
    'easyBotAvatar1',
    'easyBotAvatar2',
    'easyBotAvatar3',
    'easyBotAvatar4',
    'easyBotAvatar5',
    'hardBotAvatar1',
    'hardBotAvatar2',
    'hardBotAvatar3',
    'hardBotAvatar4',
    'hardBotAvatar5',
];

export const BOT_NAMES = new Set([
    'Jimmy',
    'Sasha',
    'BeepBoop',
    'Martin',
    'Wayne',
    'Fabian',
    'Juan',
    'Oliver',
    'Maria',
    'Wilson',
    'Laura',
    'Noah',
    'James',
    'Benjamin',
    'Lucas',
    'Henry',
    'Alexander',
    'Mason',
    'Michael',
    'Ethan',
    'Daniel',
    'Jacob',

    'Terminator',
    'Skynet',
    'Stockfish',
    'AlphaZero',
    'DeepBlue',
    'Mario',
    'Spooky',
    'Sonic',
    'Lynne',
    'Optix',
    'Machina',
]);
