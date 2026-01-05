import express from 'express';
import path from 'path';

const app = express();

// ============================================
// TEST GROUP 1: SHOULD BE CAPTURED ✅
// (These serve presentable pages)
// ============================================

// Test 1.1: Simple sendFile with path.join
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Test 1.2: render method with EJS
app.get('/home', (req, res) => {
    res.render('home.ejs');
});

// Test 1.3: render with PUG
app.get('/about', (req, res) => {
    res.render('about.pug');
});

// Test 1.4: sendFile with direct path
app.get('/contact', (req, res) => {
    res.sendFile('contact.html');
});

// Test 1.5: Handlebars template
app.get('/dashboard', (req, res) => {
    res.render('dashboard.hbs');
});

// Test 1.6: Nested in path.resolve
app.get('/profile', (req, res) => {
    res.sendFile(path.resolve(__dirname, 'public', 'profile.html'));
});

// Test 1.7: JADE template
app.get('/admin', (req, res) => {
    res.render('admin.jade');
});

// Test 1.8: POST request with HTML response
app.post('/submit', (req, res) => {
    res.sendFile(path.join(__dirname, 'success.html'));
});

// Test 1.9: Multiple statements, file is second
app.get('/blog', (req, res) => {
    console.log('Blog accessed');
    res.render('blog.ejs');
});

// Test 1.10: Chained status code (should still extract file)
app.get('/terms', (req, res) => {
    res.status(200).sendFile(path.join(__dirname, 'terms.html'));
});

// ============================================
// TEST GROUP 2: SHOULD BE IGNORED ❌
// (These don't serve presentable pages)
// ============================================

// Test 2.1: Plain text response
app.get('/pricing', (req, res) => {
    res.send("Pricing");
});

// Test 2.2: JSON API response
app.get('/api/users', (req, res) => {
    res.json({ users: [] });
});

// Test 2.3: Redirect
app.get('/old-page', (req, res) => {
    res.redirect('/new-page');
});

// Test 2.4: Send with no file extension
app.get('/text', (req, res) => {
    res.send('Some text content');
});

// Test 2.5: Status only
app.get('/health', (req, res) => {
    res.sendStatus(200);
});

// Test 2.6: JSON with status
app.get('/api/data', (req, res) => {
    res.status(200).json({ data: 'value' });
});

// Test 2.7: Send with JS file (not presentable)
app.get('/script', (req, res) => {
    res.sendFile('script.js');
});

// Test 2.8: Send with CSS file (not presentable)
app.get('/styles', (req, res) => {
    res.sendFile('styles.css');
});

// ============================================
// TEST GROUP 3: EDGE CASES 🔍
// (Test parser robustness)
// ============================================

// Test 3.1: Dynamic route parameter
app.get('/user/:id', (req, res) => {
    res.render('user.ejs');
});

// Test 3.2: Multiple route params
app.get('/blog/:year/:month/:slug', (req, res) => {
    res.render('post.html');
});

// Test 3.3: Query string in file name (should clean)
app.get('/search', (req, res) => {
    res.render('search.ejs?v=1');
});

// Test 3.4: Hash in file name (should clean)
app.get('/docs', (req, res) => {
    res.sendFile('docs.html#section');
});

// Test 3.5: File with spaces (edge case)
app.get('/special', (req, res) => {
    res.sendFile('my page.html');
});

// Test 3.6: Deeply nested path.join
app.get('/nested', (req, res) => {
    res.sendFile(path.join(path.dirname(__dirname), 'views', 'nested.html'));
});

// Test 3.7: Multiple response methods (should catch first)
app.get('/multi', (req, res) => {
    if (req.query.format === 'json') {
        res.json({ data: 'value' });
    } else {
        res.render('multi.html');
    }
});

// Test 3.8: Template literal (currently won't work - marked as future enhancement)
// app.get('/dynamic', (req, res) => {
//     res.render(`${templateDir}/page.ejs`);
// });

// ============================================
// TEST GROUP 4: CURRENTLY UNSUPPORTED ⚠️
// (Based on your //! comments - future enhancements)
// ============================================

// Test 4.1: Regular function (not arrow function)
app.get('/legacy', function(req, res) {
    res.render('legacy.html');
});

// Test 4.2: Dynamic path (not literal string)
const homePath = '/home-page';
app.get(homePath, (req, res) => {
    res.render('dynamic.html');
});

// Test 4.3: Regex route
app.get(/^\/regex-.*/, (req, res) => {
    res.render('regex.html');
});

// Test 4.4: Multiple handlers (middleware pattern)
app.get('/protected', authenticate, (req, res) => {
    res.render('protected.html');
});

// Test 4.5: Named function reference
const pageHandler = (req, res) => {
    res.render('handler.html');
};
app.get('/handled', pageHandler);

// ============================================
// EXPECTED OUTPUT
// ============================================

/*
SHOULD CAPTURE (10 routes):
1. GET / → index.html
2. GET /home → home.ejs
3. GET /about → about.pug
4. GET /contact → contact.html
5. GET /dashboard → dashboard.hbs
6. GET /profile → profile.html
7. GET /admin → admin.jade
8. POST /submit → success.html
9. GET /blog → blog.ejs
10. GET /terms → terms.html

SHOULD IGNORE (8 routes):
- GET /pricing (plain text)
- GET /api/users (JSON)
- GET /old-page (redirect)
- GET /text (text content)
- GET /health (status only)
- GET /api/data (JSON)
- GET /script (JS file)
- GET /styles (CSS file)

EDGE CASES (7 routes):
- Should capture files despite dynamic routes (:id params)
- Should clean query strings and hashes
- Should handle deeply nested paths

UNSUPPORTED (5 routes):
- Regular functions (not arrow functions)
- Dynamic paths (variables)
- Regex routes
- Multiple handlers
- Named function references
*/