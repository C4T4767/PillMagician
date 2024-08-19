const express = require('express');
const session = require('express-session');
const ejsLayouts = require('express-ejs-layouts');
const bodyParser = require('body-parser');
const path = require('path');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 60003;
const { json } = require('express');

const morgan = require('morgan');

const http = require('http'); // http 서버 추가
const socketIo = require('socket.io'); // socket.io 추가
const server = http.createServer(app);

const io = socketIo(server); // 소켓 서버 생성


app.set('socketio', io);

// admin-web의 public 폴더를 정적 파일 제공을 위한 경로로 지정
app.use(express.static(path.join(__dirname, '../frontend/admin-web/public')));

app.use('/aidata', express.static(path.join(__dirname, '../ai/aidata')));
// admin-web의 뷰 경로 설정
app.set('views', path.join(__dirname, '../frontend/admin-web/views'));
app.set('view engine', 'ejs');
// 레이아웃 경로 설정
app.use(ejsLayouts);
app.set('layout', 'layout');
app.set("layout extractScripts", true);

// JSON 형식의 요청 본문을 파싱하기 위해 body-parser 미들웨어 사용
app.use(express.json({
  limit : "50mb"
}));
app.use(bodyParser.urlencoded({
  limit:"50mb",
  extended: false
}));
app.use(bodyParser.json());

app.use(morgan('dev'));


// 세션 설정
app.use(session({
  secret: 'secret',
  resave: true,
  saveUninitialized: true
}));

// CORS 설정
const corsOptions = {
  origin: 'http://localhost:60003',
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  credentials: true,
  optionsSuccessStatus: 204
};
app.use(cors(corsOptions));

// 소켓 연결 설정
io.on('connection', (socket) => {
  console.log('Client connected');

  // 클라이언트로부터 학습 상황 업데이트를 받음
  socket.on('trainingUpdate', (update) => {
    io.emit('trainingUpdate', update); // 모든 클라이언트에게 학습 상황 업데이트 전달
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});

// Routes
const indexRoutes = require('./routes/index');
const adminRoutes = require('./routes/admin');
const usersRoutes = require('./routes/usersRoutes');
const userManagementsRoutes = require('./routes/userManagementsRoutes');
const aiRoutes = require('./routes/ai');
const serviceRoutes = require('./routes/service');
const dataRoutes = require('./routes/data');
const logRoutes = require('./routes/log');


app.use('/', indexRoutes);
app.use('/admin', adminRoutes);
app.use('/users', usersRoutes);
app.use('/userManagements', userManagementsRoutes);
app.use('/ai', aiRoutes);
app.use('/service', serviceRoutes)
app.use('/data', dataRoutes)
app.use('/log', logRoutes)

// Express 애플리케이션을 HTTP 서버에 연결
server.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});



module.exports = { io }; // WebSocket 서버를 다른 모듈에서 사용할 수 있도록 내보내기