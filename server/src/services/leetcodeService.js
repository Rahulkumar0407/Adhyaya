// LeetCode Stats Fetching Service
// Uses LeetCode's public GraphQL API to fetch user stats

class LeetCodeService {
    constructor() {
        this.baseUrl = 'https://leetcode.com/graphql';
    }

    /**
     * Fetch user stats from LeetCode
     * @param {string} username - LeetCode username
     * @returns {Promise<object>} User stats
     */
    async getUserStats(username) {
        try {
            const query = `
                query userPublicProfile($username: String!) {
                    matchedUser(username: $username) {
                        username
                        submitStats: submitStatsGlobal {
                            acSubmissionNum {
                                difficulty
                                count
                            }
                        }
                        profile {
                            ranking
                            reputation
                        }
                    }
                    userContestRanking(username: $username) {
                        rating
                        globalRanking
                        attendedContestsCount
                    }
                }
            `;

            const response = await fetch(this.baseUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Origin': 'https://leetcode.com',
                    'Referer': 'https://leetcode.com'
                },
                body: JSON.stringify({
                    query,
                    variables: { username }
                })
            });

            if (!response.ok) {
                throw new Error(`LeetCode API returned ${response.status}`);
            }

            const data = await response.json();

            if (!data.data?.matchedUser) {
                throw new Error('User not found on LeetCode');
            }

            return this.parseStats(data.data);
        } catch (error) {
            console.error('LeetCode fetch error:', error.message);
            throw error;
        }
    }

    /**
     * Parse LeetCode API response into our format
     */
    parseStats(data) {
        const user = data.matchedUser;
        const contestRanking = data.userContestRanking;

        const stats = {
            totalSolved: 0,
            easySolved: 0,
            mediumSolved: 0,
            hardSolved: 0,
            ranking: user.profile?.ranking || null,
            contestRating: contestRanking?.rating ? Math.round(contestRanking.rating) : null,
            streak: 0 // LeetCode doesn't expose streak via API
        };

        // Parse submission stats
        if (user.submitStats?.acSubmissionNum) {
            for (const item of user.submitStats.acSubmissionNum) {
                switch (item.difficulty) {
                    case 'All':
                        stats.totalSolved = item.count;
                        break;
                    case 'Easy':
                        stats.easySolved = item.count;
                        break;
                    case 'Medium':
                        stats.mediumSolved = item.count;
                        break;
                    case 'Hard':
                        stats.hardSolved = item.count;
                        break;
                }
            }
        }

        return {
            username: user.username,
            stats,
            lastSynced: new Date()
        };
    }

    /**
     * Validate if a LeetCode username exists
     */
    async validateUsername(username) {
        try {
            await this.getUserStats(username);
            return { valid: true };
        } catch (error) {
            return { valid: false, error: error.message };
        }
    }
}

export default new LeetCodeService();
