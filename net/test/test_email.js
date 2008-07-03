core.net.email();

emails = ["ethan@10gen.com", "fred.j.bloggs@example.net", "ethan+NOSPAM@10gen.com", "ethan@10gen.co.uk"];
for(i in emails){
    s = emails[i];
    assert(net.isEmail(s));
}

notemails = ["Dana", "ethan!@10gen.com", "ethan@ethan@ethan", "-email@10gen.com"];
for(i in notemails){
    s = notemails[i];
    assert(! net.isEmail(s));
}

exit();
