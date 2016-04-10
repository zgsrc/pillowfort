![Pillow Fort](/package.jpg "Pillow Fort")

# Pillow Fort

Auth system building blocks backed by AWS DynamoDB.

DynamoDB has higher performance and better scalability than relational databases, making it a good choice for persisting a user data.  While marginally less performant, it is also more scalable, durable, and manageable than in-memory cache clusters (e.g. memcached or redis), making it a similarly good choice for persisting session state.

## Sessions

Sessions are standard mechanism to establish identity in any client-server interaction.  Pillow Fort assumes session infrastructure is present in higher-level middleware.

```javascript
var app = require("express")();

// local session (dev only)
app.use(pf.session.memory({ ... }));

// dynq session (prod or dev)
app.use(pf.session.dynamo(pf.schema, { ... }));
```

## Simple

Pillow Fort provides a simple mechanism to create a login system.

```javascript
pf.auth.router({
    login: {
        maxAttempts: 5
    },
    facebook: { 
        id: "***",
        secret: "***",
        permissions: [ ]
    },
    google: { 
        id: "xyz.apps.googleusercontent.com",
        secret: "***",
        permissions: [ ]
    }
}).mount("/auth", app);

pf.init({ ... }, err => {
    app.listen(80);
});
```

The `router` method creates a [`gencall`](http://github.com/triploc/gencall) router to help with parameter validation.  To enable all `gencall` functionality, use the `mount` method rather than the traditional `app.use` call.

## Advanced

Pillow Fort provides multiple authentication toolkits to customize a login system.  A well-considered login system has a complicated logical flow.

1. A user must be registered with unique login identifiers (e.g. a username), avoiding clashes with existing identities.
2. Passwords are employed to control access to identities.  They should be stored and challenged using an opaque mechanism.
3. Login identifiers often double as communication channels (i.e. email or phone) whose ownership must be verified to establish trust.
4. When passwords are forgotten, a verified communication channel is necessary to facilitate a reset.
5. To prevent hijacking of an authenticated session, best practices requires knowledge of the current password to change the password.
6. Successful login requires a login identifier and a password.  Depending on the user state and application requirements, additional registration steps may be required before accessing protected resources.
7. The system must limit the number of invalid login attempts to prevent brute force attacks.  Once an maximum number of invalid login attempts is reached, an account should be "locked", preventing further login attempts until the identity is unlocked through the verified communication channel.

This flow needs to be implemented and tested in full or a third-party login system (e.g. facebook or google) should be used to automatically handle many of the complexities.  Pillow Fort makes either approach (or a combination) easy.

#### Proprietary

The proprietary toolkit uses the DynamoDB schema to power the authentication system.  

1. To use the proprietary system, configure it to your specifications.
    * config(options)

2. Use the middleware (i.e. `function(req, res, next)`) to piece together a login system.
    * register
    * login
    * verify
    * forgotPwd
    * resetPwd
    * changePwd
    * logout

#### Social

Pillow Fort comes with OAuth login toolkits for a variety of services.  Each toolkit follows the basic interface set out below.

```javascript
var social = pf.auth.facebook;

// Generates the url to which you redirect the user
social.redirectUrl(appId, callbackUrl, permissions, state);

// Returns middleware handling the redirect and CRSF state via the session infrastructure
social.getLoginHandler(appId, callbackUrl, permissions);

// Requests an access token given the code received from a successful facebook login
social.getAccessToken(appId, appSecret, callbackUrl, code, cb);

// Returns middleware to handle the facebook.com callback after a login attempt
social.getCallbackHandler(appId, appSecret, callbackUrl, successTemplate, errorTemplate);

// Returns middleware that creates/updates a login entity from a successfully retrieved access token.
social.getConnectionHandler(schema);
```

##### Amazon

1. To use Amazon, [create an application](http://login.amazon.com/manageApps).
2. Then, [choose the permissions](https://developer.amazon.com/public/apis/engage/login-with-amazon/docs/customer_profile.html) that you need.
3. Wire up a login flow using middleware in the `pf.auth.amazon` toolkit.

##### AOL

1. Obtain an AOL client id and secret.
2. Wire up a login flow using middleware in the `pf.auth.aol` toolkit.

##### Box

1. To use Box, [create an application](https://app.box.com/developers/services).
2. Wire up a login flow using middleware in the `pf.auth.box` toolkit.

##### Dropbox

1. To use Dropbox, [create an application](https://www.dropbox.com/developers/apps/create).
2. Wire up a login flow using middleware in the `pf.auth.dropbox` toolkit.

##### Facebook

1. To use Facebook, [create an application](https://developers.facebook.com/docs/apps/register).
2. Then, [choose the permissions](https://developers.facebook.com/docs/facebook-login/permissions) that you need.
3. Wire up a login flow using middleware in the `pf.auth.facebook` toolkit.

##### Github

1. To use Github, [create an application](https://github.com/settings/applications/new).
2. Then, [choose the permissions](https://developer.github.com/v3/oauth/#scopes) that you need.
3. Wire up a login flow using middleware in the `pf.auth.github` toolkit.

##### Google

1. To use Google, [create an application](https://console.developers.google.com/projectselector/apis/library).
2. Then, [choose the permissions](https://developers.google.com/identity/protocols/googlescopes) that you need.
3. Wire up a login flow using middleware in the `pf.auth.google` toolkit.

##### Instagram

1. To use Instagram, [create an application](https://www.instagram.com/developer/clients/manage/).
2. Then, [choose the permissions](https://www.instagram.com/developer/authorization/) that you need.
3. Wire up a login flow using middleware in the `pf.auth.instagram` toolkit.

##### LinkedIn

1. To use LinkedIn, [create an application](https://www.linkedin.com/secure/developer?newapp=).
2. Then, [choose the permissions](https://developer.linkedin.com/docs/fields) that you need.
3. Wire up a login flow using middleware in the `pf.auth.linkedin` toolkit.

##### Microsoft

1. To use Microsoft, [create an application](https://apps.dev.microsoft.com/Disambiguation?ru=https%3a%2f%2fapps.dev.microsoft.com%2f).
2. Then, [choose the permissions](https://msdn.microsoft.com/en-us/library/hh243646.aspx) that you need.
3. Wire up a login flow using middleware in the `pf.auth.microsoft` toolkit.

##### Salesforce

1. To use Salesforce, [create an application](https://developer.salesforce.com/signup).
2. Then, [choose the permissions](https://help.salesforce.com/apex/HTViewHelpDoc?id=remoteaccess_oauth_scopes.htm) that you need.
3. Wire up a login flow using middleware in the `pf.auth.salesforce` toolkit.

##### VK

1. To use VK, [create an application](https://vk.com/apps?act=manage).
2. Then, [choose the permissions](https://vk.com/dev/permissions) that you need.
3. Wire up a login flow using middleware in the `pf.auth.vk` toolkit.

##### Yahoo

1. To use Yahoo, [create an application](https://developer.yahoo.com/apps/create/).
2. Then, [choose the permissions](https://developer.yahoo.com/oauth2/guide/yahoo_scopes/) that you need.
3. Wire up a login flow using middleware in the `pf.auth.yahoo` toolkit.

##### Yammer

1. To use Yammer, [create an application](https://www.yammer.com/client_applications).
2. Then, [choose the permissions](https://msdn.microsoft.com/office/office365/howto/application-manifest#AppManifest_YammerScopes) that you need.
3. Wire up a login flow using middleware in the `pf.auth.yammer` toolkit.

##### Yandex

1. To use Yandex, [create an application](https://oauth.yandex.com/client/new).
2. Then, [choose the permissions](https://tech.yandex.com/money/doc/dg/concepts/protocol-rights-docpage/) that you need.
3. Wire up a login flow using middleware in the `pf.auth.yandex` toolkit.
    
## Model

Low-level operations are exposed through a data model implemented with [Dynq](http://github.com/triploc/dynq).

The data model is pretty standard.  There are users, which have privileges/roles and can have one or more logins.  Multiple logins let many unique identifiers (email, phone, social) all link back to the same system identity, which can be useful.

```javascript
var pf = require("pillowfort");
pf.init({ ... }, err => {
    var schema = pf.schema,
        users = schema.tables.users,
        logins = schema.tables.logins,
        sessions = schema.tables.sessions;
});
```

#### Users

* create(user, cb)
* modify(user, cb)
* login(user, pwd, cb)
* changePwd(user, oldPwd, newPwd, cb)
* setPwd(user, newPwd, cb)
* forgotPwd(user, cb)
* resetPwd(user, confirmation cb)
* lock(user, cb)
* unlock(user, cb)
* is(id, role, cb)
* grant(id, role, cb)
* rescind(id, role, cb)

#### Logins

* forUser(user, cb)
* claim(id, cb)
* connect(profile, user, cb)
* verify(login, user, code, cb)
* bind(login, user, cb)
* free(login, cb)

#### Sessions

* destroySession(sid, cb)
* getSession(sid, cb)
* setSession(sid, obj, cb)
* touchSession(sid, obj, cb)
* destroyIdleSession(before, cb)