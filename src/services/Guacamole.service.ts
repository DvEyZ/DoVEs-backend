interface GuacamoleServiceUser
{
    get() :Promise<any>;
    create(password :string) :Promise<any>;
    delete() :Promise<any>;
    addConnection(connectionName :string) :Promise<any>;
    addConnectionGroup(connectionGroupName :string) :Promise<any>;
    addUserGroup(userGroupName :string) :Promise<any>;
}

interface GuacamoleServiceConnection
{
    get() :Promise<any>;
    create(groupName :string, protocol :string, host :string, port :number) :Promise<any>;
    delete() :Promise<any>;
}

interface GuacamoleServiceUserGroup
{
    get() :Promise<any>;
    create() :Promise<any>;
    delete() :Promise<any>;
}

interface GuacamoleServiceConnectionGroup
{
    get() :Promise<any>;
    create() :Promise<any>;
    delete() :Promise<any>;
}

interface IGuacamoleService
{
    user(name :string) :GuacamoleServiceUser;
    connection(name :string) :GuacamoleServiceConnection;
    userGroup(name :string) :GuacamoleServiceUserGroup;
    connectionGroup(name :string) :GuacamoleServiceConnectionGroup;
}


export class GuacamoleService implements IGuacamoleService
{
    static apis :{
        [key: string] :{token :string, dataSource :string}
    } = {};

    constructor(private apiUrl :string, private adminUsername :string, private adminPassword :string)
    {
        this.#getToken();
    }

    async #requireNewToken() :Promise<any>
    {
        let key = await fetch(`${this.apiUrl}/tokens`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: new URLSearchParams({
                username: this.adminUsername,
                password: this.adminPassword
            })
        }).then((res) => res.json());

        return key;
    }

    async #getToken() :Promise<{token :string, dataSource :string}>
    {
        if(!GuacamoleService.apis[this.apiUrl])
        {
            let newKey = await this.#requireNewToken();

            GuacamoleService.apis[this.apiUrl] = {
                token: newKey.authToken,
                dataSource: newKey.dataSource,
            }
        }
        let key = GuacamoleService.apis[this.apiUrl];

        // check if key is valid, retry on 401.
        let v = await fetch(`${this.apiUrl}/session/data/users` + new URLSearchParams({
            token: key.token
        }));

        if(!v.ok)
            key = await this.#getToken();

        return key;
    }

    async #resolveConnectionName(connectionName :string) :Promise<any>
    {
        // todo
    }

    async #resolveConnectionGroupName(connectionName :string) :Promise<any>
    {
        // todo
    }

    user(name :string) :GuacamoleServiceUser {
        let apiUrl = this.apiUrl
        let getToken = this.#getToken;
        let resolveConnectionName = this.#resolveConnectionName;
        let resolveConnectionGroupName = this.#resolveConnectionGroupName;

        return {
            async get() :Promise<any>
            {
                let { token, dataSource } = await getToken();
                let user = await fetch(`${apiUrl}/session/data/${dataSource}/users/${name}?` + new URLSearchParams({
                    'token': token
                })).then((res) => res.json());

                return user;
            },
            async create(password :string) :Promise<any>
            {
                let { token, dataSource } = await getToken();
                let user = await fetch(`${apiUrl}/session/data/${dataSource}/users?` + new URLSearchParams({
                    'token': token
                }), {
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        "username": name,
                        "password": password,
                        "attributes": {
                            "disabled": "",
                            "expired": "",
                            "access-window-start": "",
                            "access-window-end": "",
                            "valid-from": "",
                            "valid-until": "",
                            "timezone": null,
                            "guac-full-name": "",
                            "guac-organization": "",
                            "guac-organizational-role": ""
                        }
                    })
                }).then((res) => res.json());

                return user;
            },
            async delete() :Promise<any>
            {
                let { token, dataSource } = await getToken();
                let user = await fetch(`${apiUrl}/session/data/${dataSource}/users/${name}?` + new URLSearchParams({
                    'token': token
                }), {
                    method: 'DELETE'
                }).then((res) => res.json());

                return user;
            },
            async addConnection(connectionName :string) :Promise<any>
            {
                let { token, dataSource } = await getToken();
                let connection = await resolveConnectionName(connectionName);

                await fetch(`${apiUrl}/session/data/${dataSource}/users/${name}/permissions?` + new URLSearchParams({
                    'token': token
                }), {
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify([
                        {
                            op: 'add',
                            path: `/connectionPermissions/${connection}`,
                            value: 'READ'
                        }
                    ])
                });
            },
            async addConnectionGroup(connectionGroupName :string) :Promise<any>
            {
                let { token, dataSource } = await getToken();
                let connectionGroup = await resolveConnectionGroupName(connectionGroupName);

                await fetch(`${apiUrl}/session/data/${dataSource}/users/${name}/permissions?` + new URLSearchParams({
                    'token': token
                }), {
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify([
                        {
                            op: 'add',
                            path: `/connectionGroupPermissions/${connectionGroup}`,
                            value: 'READ'
                        }
                    ])
                });
            },
            async addUserGroup(userGroupName :string) :Promise<any>
            {
                let { token, dataSource } = await getToken();
                await fetch(`${apiUrl}/session/data/${dataSource}/users/${name}/userGroups?` + new URLSearchParams({
                    'token': token
                }), {
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify([
                        {
                            op: 'add',
                            path: '/',
                            value: userGroupName
                        }
                    ])
                });
            }
        }
    }

    connection(name :string) :GuacamoleServiceConnection
    {
        let apiUrl = this.apiUrl
        let getToken = this.#getToken;
        let resolveConnectionName = this.#resolveConnectionName;
        return {
            async get() :Promise<any>
            {
                let { token, dataSource } = await getToken();
                let conName = resolveConnectionName(name);

                let con = await fetch(`${apiUrl}/session/data/${dataSource}/connections/${conName}?` + new URLSearchParams({
                    'token': token
                })).then((res) => res.json());
                return con;
            },
            async create(groupName :string, protocol :string, host :string, port :number) :Promise<any>
            {
                let { token, dataSource } = await getToken();

                let con = await fetch(`${apiUrl}/session/data/${dataSource}/connections?` + new URLSearchParams({
                    'token': token
                }), {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        "parentIdentifier": groupName,
                        "name": name,
                        "protocol": protocol,
                        "parameters": {
                            "port": port,
                            "read-only": "",
                            "swap-red-blue": "",
                            "cursor": "",
                            "color-depth": "",
                            "clipboard-encoding": "",
                            "disable-copy": "",
                            "disable-paste": "",
                            "dest-port": "",
                            "recording-exclude-output": "",
                            "recording-exclude-mouse": "",
                            "recording-include-keys": "",
                            "create-recording-path": "",
                            "enable-sftp": "",
                            "sftp-port": "",
                            "sftp-server-alive-interval": "",
                            "enable-audio": "",
                            "color-scheme": "",
                            "font-size": "",
                            "scrollback": "",
                            "timezone": null,
                            "server-alive-interval": "",
                            "backspace": "",
                            "terminal-type": "",
                            "create-typescript-path": "",
                            "hostname": host,
                            "host-key": "",
                            "private-key": "",
                            "username": "",
                            "password": "",
                            "passphrase": "",
                            "font-name": "",
                            "command": "",
                            "locale": "",
                            "typescript-path": "",
                            "typescript-name": "",
                            "recording-path": "",
                            "recording-name": "",
                            "sftp-root-directory": ""
                        },
                        "attributes": {
                            "max-connections": "",
                            "max-connections-per-user": "",
                            "weight": "",
                            "failover-only": "",
                            "guacd-port": "",
                            "guacd-encryption": "",
                            "guacd-hostname": ""
                        }
                    })
                }).then((res) => res.json());
                return con;
            },
            async delete() :Promise<any>
            {
                let { token, dataSource } = await getToken();
                let conName = resolveConnectionName(name);

                let con = await fetch(`${apiUrl}/session/data/${dataSource}/connections/${conName}?` + new URLSearchParams({
                    'token': token
                }), {
                    method: 'DELETE'
                }).then((res) => res.json());
                return con;
            }
        }
    }

    userGroup(name :string) :GuacamoleServiceUserGroup
    {
        let apiUrl = this.apiUrl
        let getToken = this.#getToken;
        return {
            async get() :Promise<any>
            {
                let { token, dataSource } = await getToken();

                let group = await fetch(`${apiUrl}/session/data/${dataSource}/userGroups/${name}?` + new URLSearchParams({
                    'token': token
                })).then((res) => res.json());

                return group;
            },
            async create() :Promise<any>
            {
                let { token, dataSource } = await getToken();

                let group = await fetch(`${apiUrl}/session/data/${dataSource}/userGroups?` + new URLSearchParams({
                    'token': token
                }), {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        "identifier": name,
                        "attributes": {
                            "disabled": ""
                        }
                    })
                }).then((res) => res.json());
                return group;
            },
            async delete() :Promise<any>
            {
                let { token, dataSource } = await getToken();

                let group = await fetch(`${apiUrl}/session/data/${dataSource}/userGroups/${name}?` + new URLSearchParams({
                    'token': token
                }), {
                    method: 'DELETE'
                }).then((res) => res.json());
                return group;
            }
        }
    }

    connectionGroup(name :string) :GuacamoleServiceConnectionGroup
    {
        let apiUrl = this.apiUrl
        let getToken = this.#getToken;
        let resolveConnectionGroupName = this.#resolveConnectionGroupName;

        return {
            async get() :Promise<any>
            {
                let { token, dataSource } = await getToken();
                let conGroupName = await resolveConnectionGroupName(name);

                let group = await fetch(`${apiUrl}/session/data/${dataSource}/connectionGroups/${conGroupName}?` + new URLSearchParams({
                    'token': token
                })).then((res) => res.json());
                return group;   
            },
            async create() :Promise<any>
            {
                let { token, dataSource } = await getToken();

                let group = await fetch(`${apiUrl}/session/data/${dataSource}/connectionGroups?` + new URLSearchParams({
                    'token': token
                }), {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        "parentIdentifier": "ROOT",
                        "name": name,
                        "type": "ORGANIZATIONAL",
                        "attributes": {
                            "max-connections": "",
                            "max-connections-per-user": "",
                            "enable-session-affinity": ""
                        }
                    })
                }).then((res) => res.json());
                return group;
            },
            async delete() :Promise<any>
            {
                let { token, dataSource } = await getToken();
                let conGroupName = await resolveConnectionGroupName(name);

                let group = await fetch(`${apiUrl}/session/data/${dataSource}/connectionGroups/${conGroupName}?` + new URLSearchParams({
                    'token': token
                }), {
                    method: 'DELETE'
                }).then((res) => res.json());
                return group;
            }
        }
    }
}