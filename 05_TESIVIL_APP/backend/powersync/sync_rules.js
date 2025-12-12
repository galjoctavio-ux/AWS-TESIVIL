export const syncRules = `
// PowerSync Sync Rules
// Define your sync rules here
bucket('global', () => {
  // Public data accessible by everyone
  sync('materials');
  sync('assemblies');
});

bucket('user_data', (user_id) => {
  // User specific data
  sync('quotes', { user_id });
  sync('clients', { user_id });
});
`;
