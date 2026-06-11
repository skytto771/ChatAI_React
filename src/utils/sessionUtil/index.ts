interface auth {
    token: string;
    userId: string;
}

export const session = {
    sessionname: 'ChatAi_Session',
    getToken: function() {
        const auth = this.getSession();
        const token = auth ? auth.token : null;
        return token;
    },
    setSession: function(token:string, userId: string) {
        const auth = { token: 'Bearer ' + token, userId };
        localStorage.setItem(this.sessionname, JSON.stringify(auth))
    },
    getSession: function() {
        const session:auth = JSON.parse(localStorage.getItem(this.sessionname) as string);
        return session;
    },
    delSession: function() {
        localStorage.removeItem(this.sessionname);
    },
}