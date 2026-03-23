const cds = require('@sap/cds');

module.exports = cds.service.impl(async function () {

  /* ── Arithmetic ── */
  this.on('add',      req => req.data.a + req.data.b);
  this.on('subtract', req => req.data.a - req.data.b);
  this.on('multiply', req => req.data.a * req.data.b);
  this.on('divide',   req => {
    if (req.data.b === 0) return req.error(400, 'Division by zero');
    return req.data.a / req.data.b;
  });

  /* ── Layout: read ── */
  this.on('getLayout', async () => {
    const { Layout } = cds.entities('olivetti');
    const row = await SELECT.one.from(Layout).where({ ID: 1 });
    return row ? row.layoutData : null;
  });

  /* ── Layout: write (requires authentication) ── */
  this.on('saveLayout', async req => {
    const { Layout } = cds.entities('olivetti');
    const exists = await SELECT.one.from(Layout).where({ ID: 1 });
    if (exists) {
      await UPDATE(Layout).set({ layoutData: req.data.data }).where({ ID: 1 });
    } else {
      await INSERT.into(Layout).entries({ ID: 1, layoutData: req.data.data });
    }
    return true;
  });

});
