// dbutil.js - database helper functions

dbutil = {
    // associate a class with a table
    associate: function(cls, table){
        cls.find = table.find;
        cls.findOne = table.findOne;
        cls.save = table.save;
        cls.remove = table.remove;
        cls.prototype.save = function(){ table.save(this); };
    }
};
