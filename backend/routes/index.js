const express = require('express');
const router = express.Router();

const fs = require('fs');
const { spawn } = require('child_process');
const csv = require('csv-parser');
const connection = require('../db');
const isAuthenticated = require('./isAuthenticated');

// 디폴트 - 랜딩페이지
router.get('/', (req, res) => {
    res.render('landing_page', { layout: false });
});

// 메인 페이지

router.get('/main', isAuthenticated, (req, res) => {
    // Query to get total number of users
    const userQuery = 'SELECT COUNT(*) as total_users FROM user';
    
    // Query to get total number of feedbacks
    const feedbackQuery = 'SELECT COUNT(*) as total_feedbacks FROM feedback';
    
    // Query to get average rating
    const ratingQuery = 'SELECT AVG(rating) as average_rating FROM feedback';

    // Query to get total number of pills
    const pillQuery = 'SELECT COUNT(*) as total_pills FROM pill';
    
    // Query to get rating distribution
    const ratingDistributionQuery = `
        SELECT rating, COUNT(*) as count 
        FROM feedback 
        WHERE rating IS NOT NULL 
        GROUP BY rating
    `;

    // Query to get user age distribution
    const ageDistributionQuery = `
        SELECT FLOOR(DATEDIFF(CURDATE(), birth) / 365.25) AS age, COUNT(*) AS count
        FROM user
        GROUP BY age
        ORDER BY age
    `;

    connection.query(userQuery, (err, userResults) => {
        if (err) throw err;
        const totalUsers = userResults[0].total_users;

        connection.query(feedbackQuery, (err, feedbackResults) => {
            if (err) throw err;
            const totalFeedbacks = feedbackResults[0].total_feedbacks;

            connection.query(ratingQuery, (err, ratingResults) => {
                if (err) throw err;
                const averageRating = parseFloat(ratingResults[0].average_rating).toFixed(2);

                connection.query(pillQuery, (err, pillResults) => {
                    if (err) throw err;
                    const totalPills = pillResults[0].total_pills;

                    connection.query(ratingDistributionQuery, (err, ratingDistributionResults) => {
                        if (err) throw err;

                        // Prepare rating distribution data
                        const ratingDistribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
                        ratingDistributionResults.forEach(row => {
                            ratingDistribution[row.rating] = row.count;
                        });

                        connection.query(ageDistributionQuery, (err, ageDistributionResults) => {
                            if (err) throw err;

                            // Prepare age distribution data
                            const ageDistribution = ageDistributionResults.map(row => ({
                                age: row.age,
                                count: row.count
                            }));

                            // Render the main page with the fetched data
                            res.render('main', { 
                                layout: 'layouts/main_layout', 
                                user: req.session.user, 
                                totalUsers: totalUsers, 
                                totalFeedbacks: totalFeedbacks, 
                                averageRating: averageRating,
                                totalPills: totalPills,
                                ratingDistribution: ratingDistribution,
                                ageDistribution: ageDistribution
                            });
                        });
                    });
                });
            });
        });
    });
});








router.get('/err_401', (req, res) => {
    res.render('cog_error/401', { layout: false });
});

router.get('/err_404', (req, res) => {
    res.render('cog_error/404', { layout: false });
});

router.get('/err_500', (req, res) => {
    res.render('cog_error/500', { layout: false });
});


module.exports = router;