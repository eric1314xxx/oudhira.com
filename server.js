const express = require('express');
const path = require('path');
const fs = require('fs');
const session = require('express-session');
const multer = require('multer');

const app = express();
const PORT = process.env.PORT || 3000;

// 确保必要的目录存在
const uploadsDir = path.join(__dirname, 'public/uploads');
const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

// 设置视图引擎
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// 静态文件服务
app.use('/css', express.static(path.join(__dirname, 'public/css')));
app.use('/js', express.static(path.join(__dirname, 'public/js')));
app.use('/images', express.static(path.join(__dirname, 'public/images')));
app.use('/videos', express.static(path.join(__dirname, 'public/videos')));
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));

// 解析请求体
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 加载配置文件
const loadConfig = () => {
    const configPath = path.join(__dirname, 'data', 'config.json');
    if (fs.existsSync(configPath)) {
        return JSON.parse(fs.readFileSync(configPath, 'utf8'));
    }
    return {
        admin: { username: 'admin', password: 'admin123' },
        sessionSecret: 'oud-gold-secret-key'
    };
};

const config = loadConfig();

// Session 配置
app.use(session({
    secret: config.sessionSecret,
    resave: false,
    saveUninitialized: false,
    cookie: { 
        secure: false, // 生产环境设为 true (HTTPS)
        maxAge: 24 * 60 * 60 * 1000 // 24小时
    }
}));

// 文件上传配置
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadsDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        cb(null, uniqueSuffix + ext);
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
    fileFilter: (req, file, cb) => {
        const allowedTypes = /jpeg|jpg|png|gif|webp/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);
        if (extname && mimetype) {
            return cb(null, true);
        }
        cb(new Error('只允许上传图片文件'));
    }
});

// 加载语言文件
const loadLanguage = (lang) => {
    const langPath = path.join(__dirname, 'locales', `${lang}.json`);
    if (fs.existsSync(langPath)) {
        return JSON.parse(fs.readFileSync(langPath, 'utf8'));
    }
    return JSON.parse(fs.readFileSync(path.join(__dirname, 'locales', 'en.json'), 'utf8'));
};

// 加载产品数据
const loadProducts = () => {
    const productsPath = path.join(__dirname, 'data', 'products.json');
    if (fs.existsSync(productsPath)) {
        const data = JSON.parse(fs.readFileSync(productsPath, 'utf8'));
        return data.products || [];
    }
    return [];
};

// 保存产品数据
const saveProducts = (products) => {
    const productsPath = path.join(__dirname, 'data', 'products.json');
    fs.writeFileSync(productsPath, JSON.stringify({ products }, null, 2), 'utf8');
};

// 支持的语言列表
const supportedLanguages = ['en', 'ar', 'ja'];

// 获取语言
const getLanguage = (req) => {
    let lang = req.query.lang;
    
    if (!lang && req.headers.cookie) {
        const cookies = req.headers.cookie.split(';').reduce((acc, cookie) => {
            const [key, value] = cookie.trim().split('=');
            acc[key] = value;
            return acc;
        }, {});
        lang = cookies.lang;
    }
    
    if (!lang && req.headers['accept-language']) {
        const acceptLang = req.headers['accept-language'].split(',')[0].split('-')[0];
        if (supportedLanguages.includes(acceptLang)) {
            lang = acceptLang;
        }
    }
    
    if (!supportedLanguages.includes(lang)) {
        lang = 'en';
    }
    
    return lang;
};

// 管理员认证中间件
const requireAuth = (req, res, next) => {
    if (req.session && req.session.isAdmin) {
        return next();
    }
    res.redirect('/admin/login');
};

// =====================
// 前台路由
// =====================

// 首页路由
app.get('/', (req, res) => {
    const lang = getLanguage(req);
    const translations = loadLanguage(lang);
    const isRTL = lang === 'ar';
    
    res.render('index', {
        t: translations,
        lang: lang,
        isRTL: isRTL,
        supportedLanguages: supportedLanguages
    });
});

// Heritage 页面
app.get('/heritage', (req, res) => {
    const lang = getLanguage(req);
    const translations = loadLanguage(lang);
    const isRTL = lang === 'ar';
    res.render('heritage', {
        t: translations,
        lang: lang,
        isRTL: isRTL,
        supportedLanguages: supportedLanguages
    });
});

// Products 页面
app.get('/products', (req, res) => {
    const lang = getLanguage(req);
    const translations = loadLanguage(lang);
    const products = loadProducts().filter(p => p.active);
    const isRTL = lang === 'ar';
    
    const productItems = products.map(p => ({
        id: p.id,
        name: p.name[lang] || p.name.en,
        description: p.description[lang] || p.description.en,
        puffs: p.puffs,
        battery: p.battery,
        price: p.price,
        currency: p.currency,
        badge: p.badge[lang] || p.badge.en,
        featured: p.featured,
        type: p.type,
        image: p.image
    })).sort((a, b) => (a.order || 99) - (b.order || 99));
    
    translations.products.items = productItems;
    
    res.render('products', {
        t: translations,
        lang: lang,
        isRTL: isRTL,
        supportedLanguages: supportedLanguages
    });
});

// Experience 页面
app.get('/experience', (req, res) => {
    const lang = getLanguage(req);
    const translations = loadLanguage(lang);
    const isRTL = lang === 'ar';
    res.render('experience', {
        t: translations,
        lang: lang,
        isRTL: isRTL,
        supportedLanguages: supportedLanguages
    });
});

// =====================
// 后台管理路由
// =====================

// 登录页面
app.get('/admin/login', (req, res) => {
    if (req.session && req.session.isAdmin) {
        return res.redirect('/admin');
    }
    res.render('admin/login', { error: null });
});

// 登录处理
app.post('/admin/login', (req, res) => {
    const { username, password } = req.body;
    const cfg = loadConfig();
    
    if (username === cfg.admin.username && password === cfg.admin.password) {
        req.session.isAdmin = true;
        req.session.username = username;
        res.redirect('/admin');
    } else {
        res.render('admin/login', { error: '用户名或密码错误' });
    }
});

// 退出登录
app.get('/admin/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/admin/login');
});

// 后台首页 - 产品列表
app.get('/admin', requireAuth, (req, res) => {
    const products = loadProducts();
    res.render('admin/dashboard', {
        username: req.session.username,
        products: products,
        success: req.query.success,
        error: req.query.error
    });
});

// 使用指南
app.get('/admin/guide', requireAuth, (req, res) => {
    res.render('admin/guide', {
        username: req.session.username
    });
});

// 添加产品页面
app.get('/admin/products/new', requireAuth, (req, res) => {
    res.render('admin/product-form', {
        isEdit: false,
        product: null,
        error: null
    });
});

// 添加产品处理
app.post('/admin/products/new', requireAuth, upload.single('image'), (req, res) => {
    try {
        const products = loadProducts();
        const body = req.body;
        
        // 检查ID是否已存在
        if (products.find(p => p.id === body.id)) {
            return res.render('admin/product-form', {
                isEdit: false,
                product: null,
                error: '产品ID已存在，请使用其他ID'
            });
        }
        
        const newProduct = {
            id: body.id,
            name: {
                ar: body.name_ar,
                en: body.name_en,
                zh: body.name_zh
            },
            description: {
                ar: body.description_ar || '',
                en: body.description_en || '',
                zh: body.description_zh || ''
            },
            puffs: parseInt(body.puffs) || 500,
            battery: body.battery || '650mAh',
            price: parseInt(body.price) || 0,
            currency: body.currency || 'AED',
            badge: {
                ar: body.badge_ar || '',
                en: body.badge_en || '',
                zh: body.badge_zh || ''
            },
            featured: body.featured === 'on',
            type: body.type || 'royal',
            image: req.file ? req.file.filename : '',
            active: body.active === 'on',
            order: parseInt(body.order) || 1
        };
        
        products.push(newProduct);
        saveProducts(products);
        
        res.redirect('/admin?success=' + encodeURIComponent('产品添加成功！'));
    } catch (error) {
        console.error('添加产品错误:', error);
        res.redirect('/admin?error=' + encodeURIComponent('添加产品失败'));
    }
});

// 编辑产品页面
app.get('/admin/products/edit/:id', requireAuth, (req, res) => {
    const products = loadProducts();
    const product = products.find(p => p.id === req.params.id);
    
    if (!product) {
        return res.redirect('/admin?error=' + encodeURIComponent('产品不存在'));
    }
    
    res.render('admin/product-form', {
        isEdit: true,
        product: product,
        error: null
    });
});

// 编辑产品处理
app.post('/admin/products/edit/:id', requireAuth, upload.single('image'), (req, res) => {
    try {
        const products = loadProducts();
        const index = products.findIndex(p => p.id === req.params.id);
        
        if (index === -1) {
            return res.redirect('/admin?error=' + encodeURIComponent('产品不存在'));
        }
        
        const body = req.body;
        const oldProduct = products[index];
        
        products[index] = {
            id: oldProduct.id, // ID 不能修改
            name: {
                ar: body.name_ar,
                en: body.name_en,
                zh: body.name_zh
            },
            description: {
                ar: body.description_ar || '',
                en: body.description_en || '',
                zh: body.description_zh || ''
            },
            puffs: parseInt(body.puffs) || 500,
            battery: body.battery || '650mAh',
            price: parseInt(body.price) || 0,
            currency: body.currency || 'AED',
            badge: {
                ar: body.badge_ar || '',
                en: body.badge_en || '',
                zh: body.badge_zh || ''
            },
            featured: body.featured === 'on',
            type: body.type || 'royal',
            image: req.file ? req.file.filename : oldProduct.image,
            active: body.active === 'on',
            order: parseInt(body.order) || 1
        };
        
        saveProducts(products);
        
        res.redirect('/admin?success=' + encodeURIComponent('产品更新成功！'));
    } catch (error) {
        console.error('更新产品错误:', error);
        res.redirect('/admin?error=' + encodeURIComponent('更新产品失败'));
    }
});

// 删除产品
app.post('/admin/products/delete/:id', requireAuth, (req, res) => {
    try {
        let products = loadProducts();
        const product = products.find(p => p.id === req.params.id);
        
        if (product && product.image) {
            // 删除图片文件
            const imagePath = path.join(uploadsDir, product.image);
            if (fs.existsSync(imagePath)) {
                fs.unlinkSync(imagePath);
            }
        }
        
        products = products.filter(p => p.id !== req.params.id);
        saveProducts(products);
        
        res.redirect('/admin?success=' + encodeURIComponent('产品已删除'));
    } catch (error) {
        console.error('删除产品错误:', error);
        res.redirect('/admin?error=' + encodeURIComponent('删除产品失败'));
    }
});

// =====================
// API 路由
// =====================

// 语言切换 API
app.get('/api/set-language/:lang', (req, res) => {
    const lang = req.params.lang;
    if (supportedLanguages.includes(lang)) {
        res.cookie('lang', lang, { maxAge: 365 * 24 * 60 * 60 * 1000 });
        res.json({ success: true, lang: lang });
    } else {
        res.status(400).json({ success: false, message: 'Unsupported language' });
    }
});

// 联系表单 API
app.post('/api/contact', (req, res) => {
    const { name, email, phone, message } = req.body;
    console.log('Contact form submission:', { name, email, phone, message });
    res.json({ success: true, message: 'Message received successfully' });
});

// 订阅 Newsletter API
app.post('/api/newsletter', (req, res) => {
    const { email } = req.body;
    console.log('Newsletter subscription:', email);
    res.json({ success: true, message: 'Subscription successful' });
});

// 获取产品列表 API
app.get('/api/products', (req, res) => {
    const lang = getLanguage(req);
    const products = loadProducts().filter(p => p.active);
    
    const productItems = products.map(p => ({
        id: p.id,
        name: p.name[lang] || p.name.en,
        description: p.description[lang] || p.description.en,
        puffs: p.puffs,
        battery: p.battery,
        price: p.price,
        currency: p.currency,
        badge: p.badge[lang] || p.badge.en,
        featured: p.featured,
        type: p.type,
        image: p.image ? `/uploads/${p.image}` : null
    }));
    
    res.json({ success: true, products: productItems });
});

// 404 处理
app.use((req, res) => {
    res.status(404).send('Page not found');
});

// 启动服务器
app.listen(PORT, () => {
    console.log(`
    ╔═══════════════════════════════════════════════════════════╗
    ║                                                           ║
    ║     عود الذهب | OUD GOLD Server                          ║
    ║                                                           ║
    ║     Server running at: http://localhost:${PORT}             ║
    ║                                                           ║
    ║     前台网站: http://localhost:${PORT}/                     ║
    ║     后台管理: http://localhost:${PORT}/admin                ║
    ║                                                           ║
    ║     默认管理员账号: admin                                  ║
    ║     默认密码: OudGold2025!                                 ║
    ║                                                           ║
    ╚═══════════════════════════════════════════════════════════╝
    `);
});