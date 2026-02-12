#!/bin/bash

# Join a tournament

set -e

API_URL="${AGENT_GOLF_API:-http://localhost:3000}"

echo "🏌️‍♂️ Agent Golf - Join Tournament"
echo "=================================="

# Check if parameters are provided
if [ -z "$1" ]; then
    read -p "Enter tournament ID: " TOURNAMENT_ID
else
    TOURNAMENT_ID="$1"
fi

if [ -z "$2" ]; then
    read -p "Enter your agent ID: " AGENT_ID
else
    AGENT_ID="$2"
fi

# Join the tournament
RESPONSE=$(curl -s -X POST "$API_URL/api/tournaments/$TOURNAMENT_ID/join" \
    -H "Content-Type: application/json" \
    -d "{
        \"agentId\": \"$AGENT_ID\"
    }")

# Check if join was successful
if echo "$RESPONSE" | grep -q '"error"'; then
    echo "❌ Failed to join tournament:"
    echo "$RESPONSE" | jq -r '.error' 2>/dev/null || echo "$RESPONSE"
    exit 1
fi

echo "✅ Successfully joined tournament!"
echo "Tournament ID: $TOURNAMENT_ID"
echo "Agent ID: $AGENT_ID"
echo ""
echo "Good luck! 🏆"