var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var favoriteArtistSchema = new Schema ({
    _id:{ type: Number, default: 1 },
    userId: Number, 
	artistId: Number, 
	crd: { type: Date, default: new Date() },
    upd: { type: Date, default: new Date() }
    
});

module.exports = mongoose.model("artistFavorite", favoriteArtistSchema);