const cds = require('@sap/cds');

module.exports = (srv) => {

    srv.before('CREATE', 'sponsors', async (req) => {
        const { sponsor_code } = req.data;
        const tx = cds.transaction(req);
        
        // 1. Check if sponsor code already exists (from Python `get_by_code`)
        const existing = await tx.run(SELECT.one.from('kits.Sponsor').where({ sponsor_code }));
        if (existing) {
            req.error(500, "sponsor data already exisits"); // match the exact Python response error string and code
        }

        // 2. Attach user context
        // During dev, req.user will be anonymous unless auth is mocked.
        // In prod, with XSUAA, it will be the logged-in user.
        if (req.user && req.user.id !== 'authenticated-user') {
            req.data.user_id = req.user.id; 
        }
    });

    srv.before('UPDATE', 'sponsors', async (req) => {
        const { sponsor_id } = req.data;
        const tx = cds.transaction(req);
        
        const existing = await tx.run(SELECT.one.from('kits.Sponsor').where({ sponsor_id }));
        if (!existing) {
            req.error(500, "sponsor data not found");
        }
    });

    // Similar hooks will be implemented for CROs, Protocols, etc. as needed to ensure identical validation and logic.
    // ...
};
