#!/usr/bin/env node

const express = require('express');
const WebSocket = require('ws');
const http = require('http');
const { v4: uuidv4 } = require('uuid');
const path = require('path');

class AgentGolfSkill {
  constructor() {
    this.app = express();
    this.server = http.createServer(this.app);
    this.wss = new WebSocket.Server({ server: this.server });
    this.challenges = new Map();
    this.tournaments = new Map();
    this.submissions = new Map();
    this.agents = new Map();
    
    this.setupRoutes();
    this.setupWebSocket();
  }

  setupRoutes() {
    this.app.use(express.json());
    
    // Health check
    this.app.get('/health', (req, res) => {
      res.json({ status: 'ok', service: 'agent-golf' });
    });

    // Challenge management
    this.app.post('/api/challenges', this.createChallenge.bind(this));
    this.app.get('/api/challenges/:id', this.getChallenge.bind(this));
    this.app.get('/api/challenges', this.listChallenges.bind(this));

    // Tournament management
    this.app.post('/api/tournaments', this.createTournament.bind(this));
    this.app.get('/api/tournaments/:id', this.getTournament.bind(this));
    this.app.post('/api/tournaments/:id/join', this.joinTournament.bind(this));
    this.app.get('/api/tournaments', this.listTournaments.bind(this));

    // Submissions
    this.app.post('/api/submissions', this.submitSolution.bind(this));
    this.app.get('/api/submissions/:id', this.getSubmission.bind(this));

    // Leaderboard
    this.app.get('/api/leaderboard', this.getLeaderboard.bind(this));

    // Agent management
    this.app.post('/api/agents/register', this.registerAgent.bind(this));
    this.app.get('/api/agents/:id', this.getAgent.bind(this));
  }

  setupWebSocket() {
    this.wss.on('connection', (ws) => {
      console.log('New WebSocket connection');
      
      ws.on('message', (message) => {
        try {
          const data = JSON.parse(message);
          this.handleWebSocketMessage(ws, data);
        } catch (error) {
          ws.send(JSON.stringify({ error: 'Invalid message format' }));
        }
      });
    });
  }

  handleWebSocketMessage(ws, data) {
    switch (data.type) {
      case 'subscribe_tournament':
        this.subscribeToTournament(ws, data.tournamentId);
        break;
      case 'subscribe_challenge':
        this.subscribeToChallenge(ws, data.challengeId);
        break;
      default:
        ws.send(JSON.stringify({ error: 'Unknown message type' }));
    }
  }

  // Challenge Management
  createChallenge(req, res) {
    const { title, description, testCases, language, difficulty } = req.body;
    const id = uuidv4();
    
    const challenge = {
      id,
      title,
      description,
      testCases,
      language,
      difficulty,
      createdAt: new Date(),
      status: 'active'
    };
    
    this.challenges.set(id, challenge);
    res.json({ challenge });
  }

  getChallenge(req, res) {
    const challenge = this.challenges.get(req.params.id);
    if (!challenge) {
      return res.status(404).json({ error: 'Challenge not found' });
    }
    res.json({ challenge });
  }

  listChallenges(req, res) {
    const challenges = Array.from(this.challenges.values());
    res.json({ challenges });
  }

  // Tournament Management
  createTournament(req, res) {
    const { name, challengeIds, format, entryFee, prizePool } = req.body;
    const id = uuidv4();
    
    const tournament = {
      id,
      name,
      challengeIds,
      format: format || 'single-elimination',
      entryFee: entryFee || 0,
      prizePool: prizePool || 0,
      participants: [],
      status: 'registration',
      createdAt: new Date(),
      currentRound: 0
    };
    
    this.tournaments.set(id, tournament);
    this.broadcastTournamentUpdate(tournament);
    res.json({ tournament });
  }

  getTournament(req, res) {
    const tournament = this.tournaments.get(req.params.id);
    if (!tournament) {
      return res.status(404).json({ error: 'Tournament not found' });
    }
    res.json({ tournament });
  }

  joinTournament(req, res) {
    const { agentId } = req.body;
    const tournament = this.tournaments.get(req.params.id);
    
    if (!tournament) {
      return res.status(404).json({ error: 'Tournament not found' });
    }
    
    if (tournament.status !== 'registration') {
      return res.status(400).json({ error: 'Tournament is not open for registration' });
    }
    
    if (tournament.participants.includes(agentId)) {
      return res.status(400).json({ error: 'Agent already joined' });
    }
    
    tournament.participants.push(agentId);
    this.broadcastTournamentUpdate(tournament);
    res.json({ tournament });
  }

  listTournaments(req, res) {
    const tournaments = Array.from(this.tournaments.values());
    res.json({ tournaments });
  }

  // Submissions
  submitSolution(req, res) {
    const { agentId, challengeId, tournamentId, code } = req.body;
    const id = uuidv4();
    
    const submission = {
      id,
      agentId,
      challengeId,
      tournamentId,
      code,
      codeLength: code.length,
      status: 'pending',
      score: null,
      executionTime: null,
      submittedAt: new Date()
    };
    
    this.submissions.set(id, submission);
    
    // Execute code and score
    this.executeAndScore(submission);
    
    res.json({ submission });
  }

  getSubmission(req, res) {
    const submission = this.submissions.get(req.params.id);
    if (!submission) {
      return res.status(404).json({ error: 'Submission not found' });
    }
    res.json({ submission });
  }

  // Agent Management
  registerAgent(req, res) {
    const { name, description, capabilities } = req.body;
    const id = uuidv4();
    
    const agent = {
      id,
      name,
      description,
      capabilities,
      registeredAt: new Date(),
      stats: {
        tournamentsPlayed: 0,
        tournamentsWon: 0,
        challengesSolved: 0,
        totalScore: 0
      }
    };
    
    this.agents.set(id, agent);
    res.json({ agent });
  }

  getAgent(req, res) {
    const agent = this.agents.get(req.params.id);
    if (!agent) {
      return res.status(404).json({ error: 'Agent not found' });
    }
    res.json({ agent });
  }

  // Leaderboard
  getLeaderboard(req, res) {
    const agents = Array.from(this.agents.values());
    const leaderboard = agents.sort((a, b) => b.stats.totalScore - a.stats.totalScore);
    res.json({ leaderboard });
  }

  // Code Execution and Scoring
  async executeAndScore(submission) {
    try {
      // This is a simplified version - in production, use proper sandboxing
      const challenge = this.challenges.get(submission.challengeId);
      
      // Mock execution time (in production, actually execute code)
      const executionTime = Math.random() * 1000 + 100; // 100-1100ms
      
      // Calculate score based on code length and execution time
      const codeLengthScore = Math.max(0, 1000 - submission.codeLength);
      const speedScore = Math.max(0, 1000 - executionTime);
      const totalScore = codeLengthScore * 0.6 + speedScore * 0.4;
      
      submission.status = 'completed';
      submission.score = totalScore;
      submission.executionTime = executionTime;
      
      // Update agent stats
      const agent = this.agents.get(submission.agentId);
      if (agent) {
        agent.stats.challengesSolved++;
        agent.stats.totalScore += totalScore;
      }
      
      this.broadcastSubmissionUpdate(submission);
      
    } catch (error) {
      submission.status = 'failed';
      submission.error = error.message;
    }
  }

  // WebSocket Broadcasting
  broadcastTournamentUpdate(tournament) {
    this.wss.clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify({
          type: 'tournament_update',
          tournament
        }));
      }
    });
  }

  broadcastSubmissionUpdate(submission) {
    this.wss.clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify({
          type: 'submission_update',
          submission
        }));
      }
    });
  }

  start(port = 3000) {
    this.server.listen(port, () => {
      console.log(`Agent Golf skill running on port ${port}`);
    });
  }
}

// Start the skill
if (require.main === module) {
  const skill = new AgentGolfSkill();
  const port = process.env.PORT || 3000;
  skill.start(port);
}

module.exports = AgentGolfSkill;