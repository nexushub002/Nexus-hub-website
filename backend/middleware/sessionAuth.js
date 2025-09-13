const User = require('../models/User');

async function sessionAuth(req, res, next){
try{
if(!req.session || !req.session.userId) return res.status(401).json({ message: 'Not authenticated' });
const user = await User.findById(req.session.userId).lean();
if(!user) return res.status(401).json({ message: 'Invalid session user' });
req.user = { id: user._id, roles: user.roles, manufacturerProfile: user.manufacturerProfile };
next();
} catch(err){ console.error(err); res.status(500).json({ message: 'Server error' }); }
}


module.exports = sessionAuth;