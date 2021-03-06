/**
*      Copyright (C) 2008 10gen Inc.
*
*    Licensed under the Apache License, Version 2.0 (the "License");
*    you may not use this file except in compliance with the License.
*    You may obtain a copy of the License at
*
*       http://www.apache.org/licenses/LICENSE-2.0
*
*    Unless required by applicable law or agreed to in writing, software
*    distributed under the License is distributed on an "AS IS" BASIS,
*    WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
*    See the License for the specific language governing permissions and
*    limitations under the License.
*/

core.core.file();

/** Tools for interacting with the git repository.
 * Git commands all generate output of the form <tt>{ out : output, err : error_msg, exitValue : exit_value, cmd : git_cmd, parsed : { rev : trimmed_output } }</tt>.
 * @constructor
 * @docmodule core.git.repo
 */
git.Repo = function(){
};

/** Get user information for git configuration.
 * @param {user} user User object for git name and email.
 * @return {Object} Fields: <dl>
 * <dt>GIT_AUTHOR_NAME</dt><dd>user.name</dd>
 * <dt>GIT_COMMITTER_NAME</dt><dd>user.name</dd>
 * <dt>GIT_AUTHOR_EMAIL</dt><dd>user.email</dd>
 * <dt>GIT_COMMITTER_EMAIL</dt><dd>user.email</dd>
 * </dl>
 */
git.Repo.getEnv = function(user){
        // We pass this environment on commit and pull commands.
        var env = {};

        env.GIT_AUTHOR_NAME = user.name;
        env.GIT_COMMITTER_NAME = user.name;
        env.GIT_AUTHOR_EMAIL = user.email;
        env.GIT_COMMITTER_EMAIL = user.email;
        return env;
};



Object.extend(git.Repo.prototype,
              /** @lends git.Repo */
              {
    _validate: function(files){
        for(var i = 0; i < files.length; i++){
            if(files[i].trim().startsWith('/'))
                throw ("illegal absolute path: "+ files[i]);
        }
    },
    _exec: function(cmd){
        cmd = "git " + cmd;
        var foo = sysexec( cmd );
        foo.cmd = cmd;

        return foo;
    },
    _init: function(){
        print(scope.getRoot());
        return this._exec("init");
    },
    _clone: function(from, as){
        var cmd = "clone " + from;
        if(as) cmd += " " + as;
        return this._exec( cmd );
    },
                      /** Get the commit id of the repository HEAD.
                       * Uses the command: <tt>git rev-parse HEAD</tt>
                       * @return {Object}  Standard git.Repo output.
                       */
    getCurrentRev: function(){
        var ref = this._exec( "rev-parse HEAD" );

        var parsed = {rev: ref.out.trim()};

        ref.parsed = parsed;
        return ref;
    },
                      /** List references in a given repository.
                       * @param {string} repos Repository in which to look for references
                       * @return {Object} Standard git.Repo output.
                       */
    showRef: function(ref){
        var ret =  this._exec( "show-ref " + ref );
        ret.parsed = {rev: ret.out.trim().split(/\s/)[0]};

        return ret;
    },
                      /** Return the last commit for a given repository.
                       * @param {string} repos Repository to use
                       * @return {Object} Standard git.Repo output.
                       */
    getCommit: function(rev){
        var ret = this._exec( "log -n 1 "+rev );
        var parsed = {};

        var lines = ret.out.trim().split(/\n/);
        // lines[0] -> commit d3ce0cfde8ba...
        for(var i = 1; i < lines.length; i++){
            if(lines[i].indexOf(':') == -1) break;
            var header = lines[i].split(/:/);
            parsed[header[0].toLowerCase()] = header[1].trim();
        }

        // lines[i] -> blank
        ++i;
        var messagelines = lines.slice(i, lines.length).map(function(s){
            return s.substr(4);
        });
        parsed.message = messagelines.join('\n');

        ret.parsed = parsed;

        return ret;
    },

                      /** List, in chronological order, the changes between revisions
                       * @param {string} from Starting revision
                       * @param {string} to Ending revision
                       * @return {Object} Standard git.Repo output.
                       */
    listRevs: function(from, to){
        // Doesn't include rev:from
        var cmd = "log --first-parent --pretty=oneline "+from+".."+to;
        var ret = this._exec( cmd );
        var parsed = {};
        var lines = ret.out.trim().split(/\n/);
        var revs = [];
        // Reverse these -- git puts newest first
        for(var i = lines.length-1; i >= 0; --i){
            var space = lines[i].indexOf(" ");
            var id = lines[i].substring(0, space);
            var message = lines[i].substring(space+1);
            revs.push({id: id, message: message});
        }
        parsed.revs = revs;
        ret.parsed = parsed;
        return ret;
    },

                      /** Returns the git branch currently in use.
                       * @return {Object} Standard git.Repo output.
                       */
    getCurrentBranch: function(){
        var cmd = "branch";
        var ret = this._exec( cmd );
        var lines = ret.out.split(/\n/);
        var branch;

        for(var i = 0; i < lines.length; i++){
            if(lines[i].match(/^\*/)){
                branch = lines[i].substr(2);
            }
        }

        ret.parsed = {};
        ret.parsed.branch = branch;
        return ret;
    },

                      /** Returns the path that the current branch of the working tree is on.
                       * @return {Object} Standard git.Repo output.
                       */
    getCurrentHeadSymbolic: function(){
        var cmd = "symbolic-ref HEAD";
        var ret = this._exec( cmd );
        ret.parsed = {};
        ret.parsed.head = ret.out.trim();
        return ret;
    },

                      /** Push committed changes to the global repository.
                       * @return {Object} Standard git.Repo output.
                       */
    push: function(){
        var ret = this._exec( "push" );
        ret.parsed = this._parsePush(ret);
        return ret;
    },
    _parsePush: function(exec){
        var parsed = {};
        var lines = exec.err.trim().split(/\n/);
        if( lines[0].match(/^updating/) ){
            var fromrev = lines[1].substring(lines[1].lastIndexOf(' ')+1);
            var torev = lines[2].substring(lines[2].lastIndexOf(' ')+1);
            parsed.from = fromrev;
            parsed.to = torev;
            parsed.success = true;
        }
        else if(exec.err.match(/-> \w*\n/)){
            // new-style git format
            var t = this;
            lines = lines.filter(function(l){ return l.match(/->/);});
            lines.forEach(function(l){
                var m = l.match(/([^\s]+) -> (.+)/);
                if(m[1] == t.getCurrentBranch().parsed.branch){
                    if(l[1] == '!') parsed.failed = true;
                    else {
                        m = l.match(/(\w+)\.\.(\w+)/);
                        parsed.from = m[1];
                        parsed.to = m[2];
                        parsed.success = true;
                    }
                }
            });
        }
        else {
            for(var i = 0; i < lines.length-1; ++i){
                var m = lines[i].match(/remote '.+?' is not a strict subset of local ref '(.+?)'/);
                if(m){
                    var ref = m[1];
                    if(ref == this.getCurrentHeadSymbolic().parsed.head)
                        parsed.pullFirst = true;
                }
                else if(lines[i][1] == "!") {
                    var m = lines[i].match(/([\w.]+) -> ([\w.]+) \((.+)\)/);
                    if(m[1] == this.getCurrentBranch().parsed.branch && m[3] == "non-fast forward"){
                        parsed.pullFirst = true;
                    }
                }
            }
            if(! parsed.pullFirst)
                parsed.upToDate = true;
        }

        return parsed;
    },

                      /** Pull remote changes to the local repository.
                       * @param {user} user User information for identifying oneself to the git repository
                       * @return {Object} Standard git.Repo output.
                       */
    pull: function(u){
        // Pass gitEnv when we are doing a pull.
        // The reason is that when we're doing a pull, we might make a merge
        // commit. We need the right information in the environment when
        // that happens.
        var ret = sysexec( "git pull" , "" , git.Repo.getEnv(u) );
        ret.cmd = "git pull";
        ret.parsed = this._parsePull(ret);
        return ret;
    },
    _parsePull: function(exec){
        var parsed = {};
        var lines = exec.out.trim().split(/\n/);

        var created = {};
        var deleted = {};
        var changed = {};
        var conflicts = {};
        var mergetype;
        var failed;
        var merged;
        var upToDate;
        var success;

        var m;

        var parseMerge = function(start){
            if(start)
                var i = start;
            else {
                for(var i = 0; i < lines.length; ++i){
                    if(lines[i].match(/Merge made by/)) break;
                }
                ++i;
            }
            for(; i < lines.length; i++){
                if(lines[i].indexOf('|') == -1) break;
                var pipes = lines[i].split(/\|/);
                var filename = pipes[0].trim();
                var diffstat = pipes[1].trim();
                changed[filename] = diffstat;
            }
            // this line should be like:
            // "9 files changed, 211 insertions(+), 65 deletions(-)"
            ++i;

            for(; i < lines.length; i++){
                var line = lines[i];
                if(line.match(/^ create/)){
                    // FIXME: implement String.split(..., limit)
                    var firstFieldEnd = line.indexOf(/ /, 1);
                    var secondFieldEnd = line.indexOf(/ /, firstFieldEnd);
                    var thirdFieldEnd = line.indexOf(/ /, secondFieldEnd);
                    var filename = line.substring(thirdFieldEnd);
                    created[filename] = line;
                }
                else if( line.match(/^ delete /) ){
                    var firstFieldEnd = line.indexOf(/ /, 1);
                    var secondFieldEnd = line.indexOf(/ /, firstFieldEnd);
                    var thirdFieldEnd = line.indexOf(/ /, secondFieldEnd);
                    var filename = line.substring(thirdFieldEnd);
                    deleted[filename] = line;
                }
            }

        };

        if(lines.length > 0 && exec.out.match(/\nFast forward\n/)) {
            var fromrev = lines[0].substring(lines[0].lastIndexOf(" ")+1,
                lines[0].indexOf('.'));
            var torev = lines[0].substring(lines[0].lastIndexOf(".")+1);
            mergetype = "fastforward";
            parseMerge(2);

            success = true;
        }
        else if(lines.length > 0 && (m = exec.out.match(/Merge made by ([^\n]+)\./)) && m){
            mergetype = m[1];
            parseMerge();
            var errlines = exec.err.trim().split(/\n/);

            // Sometimes git doesn't have an output line saying which revisions were
            // pulled and merged. Thanks for nothing.
            for(var i = 0; i < errlines.length; ++i){
                if(m = errlines[i].match(/ ([0-9a-f]+)\.\.([0-9a-f]+)\s+([\w.]+)\s*->\s*([\w.+])/) && m){
                    if(m[3] != this.getCurrentBranch().parsed.branch) continue;
                    fromrev = m[1];
                    torev = m[2];
                    success = true;
                    break;
                }
            }

        }
        else if(lines.length == 1 && lines[0] == "Already up-to-date."){
            upToDate = true;
        }
        else {
            var m = exec.err.match(/(fatal|error): Entry '([\.\w]+)' not uptodate\. Cannot merge\.\n$/);
            if(m){
                failed = {notuptodate: m[2]};
            }
            else {
                merged = {};
                conflicts = {};
                for(var i = 0; i < lines.length; i++){
                    var m = lines[i].match(/^Auto-merged/);
                    if(m){
                        merged[m[1]] = true;
                        continue;
                    }

                    var m = lines[i].match(/CONFLICT/);
                    if(m){
                        // FIXME: files with spaces in them??
                        var file = lines[i].substring(lines[i].lastIndexOf(' ')+1);
                        conflicts[file] = lines[i];
                    }

                }
                if(exec.out.match(/Automatic merge failed/) || exec.err.match(/^Automatic merge failed/)){
                    failed = {conflicts: conflicts};
                }
            }

        }

        parsed.from = fromrev;
        parsed.to = torev;
        parsed.created = created;
        parsed.deleted = deleted;
        parsed.changed = changed;
        parsed.conflicts = conflicts;
        parsed.merged = merged;
        parsed.failed = failed;
        parsed.upToDate = upToDate;
        parsed.success = success;

        return parsed;
    },

                      /** Get remote changes and add them to the local repository without merging.
                       * @return {Object} Standard git.Repo output.
                       */
    fetch: function(){
        var cmd = "fetch";
        return this._exec( cmd );
    },

                      /** Add new or modified files to index for inclusion in the next commit.
                       * @param {Array} files Filenames of files to be added to the index.
                       * @return {Object} Standard git.Repo output.
                       */
    add: function(files){
        this._validate(files);

        var cmd = "add ";
        files.forEach( function( z ){ cmd += " " + z; } );
        return this._exec( cmd );
    },
                      /** Remove files from the working tree and index.
                       * @param {Array} files Filenames of files to be removed from the index.
                       * @param {Object} opts If opts.cached, the --cached option will be used.
                       * @return {Object} Standard git.Repo output.
                       */
    rm: function(files, opts){
        opts = opts || {};
        var cmd = "rm ";
        if(opts.cached) cmd += "--cached ";
        cmd += files.join(' ');
        return this._exec( cmd );
    },
                      /** Show a diff between the index and the working tree for one or more files.
                       * @param {Array} files Filenames of files to be diffed.
                       * @param {Object} opts If opts.rev is set, the repository opts.rev will be used as the tree to diff against
                       * @return {Object} Standard git.Repo output.
                       */
    diff: function(files, opts){
        opts = opts || {};
        this._validate(files);
        var cmd = "diff ";
        if(opts.rev) cmd += opts.rev + " ";
        files.forEach( function( z ){ cmd += " " + z; } );
        if(files.length == 2){
            // Did you know that if you give git two files, it will sometimes
            // do an ordinary diff of those files -- i.e. not compare against
            // the index? You can force this behavior on by --no-index, but
            // there's no real way to force it off. Thanks guys!

            // Fortunately if we re-give one of those two files, we bring the number
            // of files up to three, thereby not triggering the behavior.
            // By luck, this doesn't change the output from what it should be --
            // files aren't displayed twice or anything.
            // We arbitrarily choose the first file here
            // (but we could just as easily choose the second)
            cmd += " " + files[0];
        }
        return this._exec( cmd );
    },

                      /** Store the current contents of the index in a new commit along with a log message describing the changes you have made.
                       * @param {Array} files Filenames of files to be committed.  If files have already been added using git.Repo.add, this parameter is unnecessary.
                       * @param {string} msg Commit message
                       * @param {user} user User to whom commit should be attributed
                       * @return {Object} Standard git.Repo output.
                       */
    commit: function(files, msg, u){
        print( scope.getRoot() );
        if(!msg) throw "git commit needs a message";
        this._validate(files);
        var cmd = "git commit -F - ";

        cmd += " --author \"" + u.name + " <" + u.email + ">\" ";

        files.forEach( function( z ){ cmd += " " + z; } );
        log.git.repo.debug("committing; git command: " + cmd);
        var foo = sysexec( cmd , msg , git.Repo.getEnv(u) );
        foo.cmd = cmd;
        return foo;
    },

                      /** Displays paths that have differences between the index file and the current HEAD commit, paths that have differences between the working tree and the index file, and paths in the working tree that are not tracked by git.
                       * @return {Object} Standard git.Repo output.
                       */
    status: function(){
        // We don't actually call status any more; instead, we call a
        // combination of ls-files and diff-index to figure out what's up.

        var HEAD = this._exec('show-ref -h');
        if(! HEAD.out){
            // Don't use unmerged; there's no HEAD against which to check merge
            // Do use --stage instead
            // Also use --cached to check what's in the index
            // (No head, so anything that's cached must have been added)
            var ret = this._exec('ls-files -t --deleted --others --killed --modified --cached --stage');
            ret.parsed = {initial: true};
            this._parseLsFiles(ret, ret.parsed);
            delete ret.parsed.initial;
            return ret;
        }

        var ret = this._exec("ls-files -t --deleted --others --unmerged --killed --modified");

        var ret2 = this._exec('diff-index HEAD --name-status');
        ret.parsed = this._parseDiffIndex(ret2);

        this._parseLsFiles(ret, ret.parsed);

        var rename = this._exec('diff-index HEAD -M');
        rename.parsed = this._parseRename(rename);

        if(rename.parsed.renames){
            var oldStaged = ret.parsed.staged;
            ret.parsed.staged = [];
            var renames = {};
            rename.parsed.renames.forEach(function(z){
                ret.parsed.staged.push({oldName: z.oldName, name: z.newName});
                renames[z.oldName] = true;
                renames[z.newName] = true;
            });
            oldStaged.forEach(function(z){
                if(! renames[z.name])
                    ret.parsed.staged.push(z);
            });
        }

        return ret;
    },
    _parseRename: function(exec){
        var lines = exec.out.trim().split(/\n/);
        var info = {};
        var renames = [];
        for(var i = 0; i < lines.length; ++i){
            var line = lines[i];
            var newName = line.substring(line.lastIndexOf('\t')+1);
            line = line.substring(0, line.lastIndexOf('\t'));
            var oldName = line.substring(line.lastIndexOf('\t')+1);
            line = line.substring(0, line.lastIndexOf('\t'));
            var status = line.substring(line.lastIndexOf(' ')+1);

            if(status[0] == 'R')
                renames.push({oldName: oldName, newName: newName});
        }
        if (renames.length > 0)
            info.renames = renames;
        return info;
    },

    _parseDiffIndex: function(exec){
        var names = {'A': 'new file', 'M': 'modified'};
        var output = exec.out.trim();
        var lines = output.split(/\n/);
        var info = {};
        var staged = [];
        if(! output) return info;
        for(var i = 0; i < lines.length; ++i){
            var filetype = lines[i][0];
            var filename = lines[i].substring(2);

            staged.push({name: filename, type: names[filetype]});
        }
        if(staged.length > 0)
            info.staged = staged;
        return info;
    },

    _parseLsFiles: function(exec, info){
        // H   cached
        // M   unmerged
        // R   removed/deleted
        // C   modified/changed
        // K   to be killed
        // ?   other
        var output = exec.out.trim();
        var names = {'H': 'cached', 'M': 'unmerged', 'R': 'deleted',
            'C': 'changed', 'K': 'to be killed', '?': 'untracked'
                    };
        if(info.initial){
            names.H = 'new file';
        }
        var lines = output.split(/\n/);
        var unmerged = [];
        var deleted = {};
        if(! output) return info;
        for(var i = 0; i < lines.length; ++i){
            var filetype = lines[i][0];
            var filename;
            if(filetype == '?')
                filename = lines[i].substring(2);
            else // getting from --stage; huge amount of output
            filename = lines[i].substring(lines[i].indexOf('\t')+1);

            filetype = names[filetype];

            file = {name: filename};
            // 'new file' only happens when checking against an empty HEAD
            if(['deleted', 'changed', 'new file'].contains(filetype))
                file.type = filetype;

            // We don't want the file to show up twice, as it does in ls-files,
            // so if the file was previously marked "deleted", and we now see it
            // is also "changed", we just skip the "changed" part.
            // files out of "changed" if they're already deleted
            if(deleted[filename] && filetype == 'changed') continue;
            if(filetype == 'deleted') deleted[filename] = true;

            // Because gitLocal expects deleted files to show up in 'changed',
            // with a type of 'deleted':
            if(filetype == 'deleted') filetype = 'changed';

            // This only happens when checking against an empty HEAD, but:
            if(filetype == 'new file') filetype = 'staged';

            if(! (filetype in info) ) info[filetype] = [];
            info[filetype].push(file);

            if(filetype == "unmerged"){
                unmerged.push(file);
                continue;
            }

        }

        if(unmerged.length > 0) info.unmerged = unmerged;

        return info;
    },

    _parseStatus: function(exec){
        var output = exec.out;
        var info = {};
        var stat = output.trim();
        var statlines = stat.split(/\n/);
        var currentState = ""; // "untracked", "changed", "staged", ??

        var filename = "";
        var filetype = "";
        var unmerged = [];
        for(var i = 0; i < statlines.length; ++i){
            // Special cases for special lines:
            if(statlines[i].match(/# On branch (.+)$/))
                continue;

            if(statlines[i].match(/# Initial commit/))
                continue;

            if(statlines[i].match(/#\s*$/)) continue;

            if(statlines[i].match(/use \"git /)){
                // We don't need usage advice, thanks
                continue;
            }

            if(statlines[i].match(/^\w/)){
                // like "nothing to commit" or "nothing added to commit"
                // we should probably handle this!

                continue;
            }
            // END special cases


            if(statlines[i].match(/# Changed but not updated:/)){
                currentState = "changed";
                continue;
            }

            if(statlines[i].match(/# Untracked files:/)){
                currentState = "untracked";
                continue;
            }

            if(statlines[i].match(/# Changes to be committed:/)){
                currentState = "staged";
                continue;
            }

            var exec = statlines[i].match(/#\s+(modified|new file|unmerged|deleted|renamed):\s+(.+)$/);
            if(exec){
                filetype = exec[1];
                filename = exec[2];
                if(filetype == "renamed"){
                    parts = filename.split(/ -> /);
                    filename = parts[1];
                    oldfilename = parts[0];
                }
                file = {name: filename, type: filetype};
                if(filetype == "unmerged"){
                    unmerged.push(file);
                    continue;
                }
                if(filetype == "renamed"){
                    file.oldName = oldfilename;
                }
            }
            else {
                var exec = statlines[i].match(/#\s+(.+)$/);
                if (!exec) {
                        log.admingit("repo.js : _parseStatus() : Error : failed to parse " + statlines[i]);
                        return null;
                }
                file = {name: exec[1]};
            }

            if(! (currentState in info) ) info[currentState] = [];
            info[currentState].push(file);
        }

        if(unmerged.length > 0) info.unmerged = unmerged;

        return info;
    },
                      /** Updates the named paths in the working tree from the index file.  Put another way: changes in checked out files will be overwritten on the next pull.
                       * @param {Array} files Filenames of files to checked out.
                       * @param {Object} opts If opts.rev is set, the repository opts.rev will be used as the repository.
                       * If opts.force is set, proceed even if the index or the working tree differs from HEAD. This is used to throw away local changes.
                       * @return {Object} Standard git.Repo output.
                       */
    checkout: function(files, opts){
        opts = opts || {};
        this._validate(files);
        var cmd = "checkout ";
        if(opts.force) cmd += "-f ";
        if(opts.rev) cmd += opts.rev + " ";
        cmd += files.join(" ");
        var ret = this._exec( cmd );
        if(ret.out.trim() == "" && ret.err.trim() == "")
            ret.parsed = {success: true};
        return ret;
    },

                      /** If it exists, display the merge message.
                       * @return {Object} Standard git.Repo output.
                       */
    mergeMessage: function(){
        // .git/MERGE_MSG
        // if it's not there, return null (not merging)
        var f = File.open('.git/MERGE_MSG');
        if(!f.exists()) return null;
        return f.asString();
    },

});

git.Repo.prototype.dumpFile = function(file, contents){
    var f = File.create(contents);
    return f.writeToLocalFile(file);
};
