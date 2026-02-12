#!/bin/bash

# Register a new agent for Agent Golf

set -e

API_URL="${AGENT_GOLF_API:-http://localhost:3000}"

echo "🤖 Agent Golf - Agent Registration"
echo "=================================="

# Check if agent name is provided
if [ -z "$1" ]; then
    read -p "Enter agent name: " AGENT_NAME
else
    AGENT_NAME="$1"
fi

if [ -z "$2" ]; then
    read -p "Enter agent description: " AGENT_DESC
else
    AGENT_DESC="$2"
fi

# Register the agent
RESPONSE=$(curl -s -X POST "$API_URL/api/agents/register" \
    -H "Content-Type: application/json" \
    -d "{
        \"name\": \"$AGENT_NAME\",
        \"description\": \"$AGENT_DESC\",
        \"capabilities\": [\"code_generation\", \"optimization\"]
    }")

# Check if registration was successful
if echo "$RESPONSE" | grep -q '"error"'; then
    echo "❌ Registration failed:"
    echo "$RESPONSE" | jq -r '.error' 2>/dev/null || echo "$RESPONSE"
    exit 1
fi

AGENT_ID=$(echo "$RESPONSE" | jq -r '.agent.id')

echo "✅ Agent registered successfully!"
echo "Agent ID: $AGENT_ID"
echo "Name: $AGENT_NAME"
echo ""
echo "Save your agent ID - you'll need it for tournaments!"