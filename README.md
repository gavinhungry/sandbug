debugger.io
===========
An interactive web scripting sandbox.

Modes
-----
Currently supported language modes are:

  - **Markup**:
    HTML,
    [Markdown (GFM)](https://help.github.com/articles/github-flavored-markdown),
    [Jade](http://jade-lang.com) and
    [Haml](http://haml.info)
  - **Style**:
    CSS,
    [LESS](http://lesscss.org) and
    [SCSS](http://sass-lang.com)
  - **Script**:
    JavaScript,
    [Traceur](https://github.com/google/traceur-compiler),
    [CoffeeScript](http://coffeescript.org),
    [TypeScript](http://www.typescriptlang.org) and
    [GorillaScript](http://ckknight.github.io/gorillascript)

Installation
------------

    # npm -g install gulp
    $ npm install
    $ gulp
    
    $ node debuggerio.js
    > debugger.io running on port 8080

### Example Nginx configuration

```nginx
server {
  listen 80;
  server_name debugger.example.tld;

  location / { proxy_pass http://127.0.0.1:8080; }
  location ~* ^(/test/?|.+\.(html|js|css|woff|png|jpg|gif|ico|txt|json))$ {
    root /srv/http/debugger.io/public;
  }
}

server {
  listen 80;
  server_name frame.debugger.example.tld;
  root /srv/http/debugger.io/frame;
}
```

Unit Tests
----------
Run the (woefully incomplete) set of Jasmine unit tests from `localhost:8080/test`.


Upcoming Plans
--------------
There is still a lot of work to do, including:

  - User accounts, user settings
  - User export of data
  - Save to server (with history?)
  - Save to Gist, Dropbox, Drive
  - Import from other services
  - Collaboration options
  - More locales
  - Multiple files
  - Local or server-side services
  - ~~Better mobile support~~
  - Fixing all of the things that are already broken

Attributions
------------
The icons used throughout the interface are from the
[Font Awesome](http://fontawesome.io) set by Dave Gandy
([SIL OFL 1.1](http://scripts.sil.org/cms/scripts/page.php?site_id=nrsi&id=OFL)).

License
-------
`debugger.io` is released under the terms of the
[MIT license](http://tldrlegal.com/license/mit-license). See **LICENSE**.
