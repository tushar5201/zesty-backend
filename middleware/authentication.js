
function isAuthenticated (req, res, next) {
    if(req.user){
        return next;
    }
    return res.status(400).send("Not a valid User")
}

module.exports = isAuthenticated