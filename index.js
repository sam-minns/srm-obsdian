const { Plugin } = require('lyt');

class RiskManagementPlugin extends Plugin {
  // Plugin constructor
  constructor() {
    super();

    // Initialize plugin state
    this.state = {
      risks: [],
      contacts: []
    };
  }

  // Plugin initialization function
  async init() {
    // Load risks and contacts from the Obsidian vault
    this.state.risks = await this.loadRisks();
    this.state.contacts = await this.loadContacts();

    // Register event listeners
    this.registerEventListeners();
  }

  // Event listener function for adding a new risk
  async onAddRisk(event) {
    // Extract risk data from the event
    const risk = event.detail;

    // Calculate risk ranking based on number of connections
    risk.ranking = this.calculateRanking(risk);

    // Add risk to the risks array
    this.state.risks.push(risk);

    // Save risks to the Obsidian vault
    await this.saveRisks();
  }

  // Function to load risks from the Obsidian vault
  async loadRisks() {
    // Use the vault API to search for risk notes
    const notes = await this.vault.search({
      query: '#risk'
    });

    // Extract risk data from the notes
    const risks = notes.map(note => this.extractRiskData(note));

    // Return the risks array
    return risks;
  }

  // Function to save risks to the Obsidian vault
  async saveRisks() {
    // Iterate over the risks array
    for (const risk of this.state.risks) {
      // Use the vault API to update the corresponding risk note
      await this.vault.update(risk.id, {
        title: risk.title,
        ranking: risk.ranking
      });
    }
  }

  // Function to calculate the ranking of a risk based on number of connections
  calculateRanking(risk) {
    // Use the vault API to count the number of connections to the risk note
    const connections = this.vault.countConnections(risk.id);

    // Calculate the ranking based on the number of connections
    // (e.g. high risk for more than 10 connections, medium risk for 5-10 connections, low risk for fewer than 5 connections)
    if (connections > 10) {
      return 'high';
    } else if (connections > 5) {
      return 'medium';
    } else {
      return 'low';
    }
  }

  // Function to extract risk data from a note
  extractRiskData(note) {
    // Extract risk data from the note using the Markdown formatting syntax
    // (e.g. parse the title and ranking from the note title, and the description and impact from the note body)
    const title = note.title.split(' - ')[0];
    const ranking = note.title.split(' - ')[1];
    const description = note.body.split('\n')[0];
    const impact = note.body.split('\n')[1];

    // Return the risk data as an object
    return {
      id: note.id,
      title: title,
      ranking: ranking,
      description: description,
      impact: impact
    };
}
