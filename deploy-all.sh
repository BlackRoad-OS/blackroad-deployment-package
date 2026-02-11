#!/bin/bash
set -e

TEMPLATE="/tmp/blackroad-enhance/template.html"
PROJECTS_FILE="/tmp/all-pages-projects.txt"
DEPLOY_DIR="/tmp/blackroad-deploy"
LOG_FILE="/tmp/blackroad-enhance/deploy.log"

mkdir -p "$DEPLOY_DIR"
echo "Starting mass deployment at $(date)" > "$LOG_FILE"

# Project metadata - generates title, description, icon based on project name
get_metadata() {
    local project=$1
    local title desc icon status
    
    case "$project" in
        *console*) title="Console"; desc="Unified command center for BlackRoad infrastructure management"; icon="🖥️"; status="Operational" ;;
        *dashboard*) title="Dashboard"; desc="Real-time metrics and monitoring for your BlackRoad services"; icon="📊"; status="Active" ;;
        *analytics*) title="Analytics"; desc="Deep insights and intelligence across your entire infrastructure"; icon="📈"; status="Collecting Data" ;;
        *agents*) title="Agents"; desc="AI-powered autonomous agents for infrastructure automation"; icon="🤖"; status="30,000 Ready" ;;
        *admin*) title="Admin Portal"; desc="Administrative controls and system configuration"; icon="⚙️"; status="Secure" ;;
        *api*) title="API Gateway"; desc="RESTful APIs powering the BlackRoad ecosystem"; icon="🔌"; status="Online" ;;
        *docs*) title="Documentation"; desc="Comprehensive guides, tutorials, and API references"; icon="📚"; status="Updated" ;;
        *status*) title="Status"; desc="Real-time system health and incident monitoring"; icon="🟢"; status="All Systems Go" ;;
        *monitoring*) title="Monitoring"; desc="Infrastructure observability and alerting platform"; icon="👁️"; status="Watching" ;;
        *security*) title="Security"; desc="Zero-trust security and compliance management"; icon="🔒"; status="Protected" ;;
        *auth*) title="Authentication"; desc="Identity and access management services"; icon="🔐"; status="Secured" ;;
        *gateway*) title="Gateway"; desc="Edge routing and traffic management"; icon="🌐"; status="Routing" ;;
        *builder*) title="Builder"; desc="No-code platform for building BlackRoad applications"; icon="🏗️"; status="Create" ;;
        *chat*) title="Chat"; desc="AI-powered conversational interface"; icon="💬"; status="Ready" ;;
        *metaverse*) title="Metaverse"; desc="Immersive 3D virtual environments"; icon="🌌"; status="Expanding" ;;
        *quantum*) title="Quantum"; desc="Next-generation quantum computing infrastructure"; icon="⚛️"; status="Superposition" ;;
        *studio*) title="Studio"; desc="Creative tools and design platform"; icon="🎨"; status="Create" ;;
        *lucidia*) title="Lucidia"; desc="Advanced AI consciousness and reasoning engine"; icon="🧠"; status="Thinking" ;;
        *alice*) title="Alice"; desc="Personal AI assistant and automation hub"; icon="👩‍💻"; status="Listening" ;;
        *aria*) title="Aria"; desc="Harmony and orchestration services"; icon="🎵"; status="Harmonizing" ;;
        *cece*|*cecilia*) title="CECE"; desc="Sovereign AI operating system"; icon="🌟"; status="68 Apps" ;;
        *prism*) title="Prism"; desc="Multi-dimensional data visualization"; icon="💎"; status="Refracting" ;;
        *brand*) title="Brand"; desc="Design system and brand assets"; icon="✨"; status="Beautiful" ;;
        *home*|*landing*) title="Home"; desc="Welcome to the BlackRoad ecosystem"; icon="🏠"; status="Live" ;;
        *demo*) title="Demo"; desc="Interactive demonstrations and showcases"; icon="🎪"; status="Try Now" ;;
        *hello*) title="Hello World"; desc="Your first step into BlackRoad"; icon="👋"; status="Welcome" ;;
        *roadcoin*) title="RoadCoin"; desc="Decentralized digital currency"; icon="🪙"; status="Mining" ;;
        *roadchain*) title="RoadChain"; desc="Sovereign blockchain infrastructure"; icon="⛓️"; status="Blocks: ∞" ;;
        *marketing*) title="Marketing"; desc="Growth and outreach platform"; icon="📣"; status="Amplifying" ;;
        *sales*) title="Sales"; desc="Revenue and pipeline management"; icon="💰"; status="Growing" ;;
        *hr*) title="HR Portal"; desc="People operations and talent management"; icon="👥"; status="Hiring" ;;
        *operations*) title="Operations"; desc="Business operations and logistics"; icon="⚡"; status="Running" ;;
        *finance*) title="Finance"; desc="Financial management and reporting"; icon="📊"; status="Profitable" ;;
        *legal*) title="Legal"; desc="Compliance and legal resources"; icon="⚖️"; status="Compliant" ;;
        *support*) title="Support"; desc="Customer success and help center"; icon="🆘"; status="24/7" ;;
        *education*) title="Education"; desc="Learning and training platform"; icon="🎓"; status="Teaching" ;;
        *healthcare*) title="Healthcare"; desc="Health technology solutions"; icon="🏥"; status="Caring" ;;
        *research*) title="Research Lab"; desc="Innovation and R&D initiatives"; icon="🔬"; status="Discovering" ;;
        *design*) title="Design"; desc="UI/UX and creative services"; icon="🎨"; status="Creating" ;;
        *engineering*) title="Engineering"; desc="Technical development and infrastructure"; icon="🛠️"; status="Building" ;;
        *signup*|*register*) title="Sign Up"; desc="Join the BlackRoad revolution"; icon="✍️"; status="Open" ;;
        *buy*|*store*|*shop*) title="Store"; desc="BlackRoad products and services"; icon="🛒"; status="Open" ;;
        *guardian*) title="Guardian"; desc="Security monitoring and protection"; icon="🛡️"; status="Protecting" ;;
        *assets*) title="Assets"; desc="Digital asset management"; icon="📦"; status="Stored" ;;
        *explorer*) title="Explorer"; desc="Navigate and discover"; icon="🧭"; status="Exploring" ;;
        *applier*) title="Applier"; desc="Automated application system"; icon="📝"; status="Applying" ;;
        *spawner*) title="Spawner"; desc="Agent creation and deployment"; icon="🚀"; status="Spawning" ;;
        *30k*) title="30K Agents"; desc="Massive-scale AI agent deployment"; icon="🤖"; status="30,000 Strong" ;;
        *) 
            # Generate title from project name
            title=$(echo "$project" | sed 's/-/ /g' | sed 's/blackroad //gi' | sed 's/  / /g')
            title=$(echo "$title" | awk '{for(i=1;i<=NF;i++) $i=toupper(substr($i,1,1)) tolower(substr($i,2))}1')
            desc="Part of the BlackRoad distributed infrastructure ecosystem"
            icon="🛣️"
            status="Active"
            ;;
    esac
    
    echo "$title|$desc|$icon|$status"
}

deploy_project() {
    local project=$1
    local project_dir="$DEPLOY_DIR/$project"
    
    mkdir -p "$project_dir"
    
    # Get metadata
    IFS='|' read -r title desc icon status <<< "$(get_metadata "$project")"
    
    # Generate customized HTML
    sed -e "s|{{TITLE}}|$title|g" \
        -e "s|{{DESCRIPTION}}|$desc|g" \
        -e "s|{{ICON}}|$icon|g" \
        -e "s|{{STATUS}}|$status|g" \
        "$TEMPLATE" > "$project_dir/index.html"
    
    # Deploy
    output=$(wrangler pages deploy "$project_dir" --project-name="$project" 2>&1)
    
    if echo "$output" | grep -q "Deployment complete"; then
        echo "✅ $project"
        echo "SUCCESS: $project" >> "$LOG_FILE"
        return 0
    else
        echo "⚠️ $project"
        echo "FAILED: $project - $output" >> "$LOG_FILE"
        return 1
    fi
}

# Main deployment loop
total=$(wc -l < "$PROJECTS_FILE" | tr -d ' ')
success=0
failed=0
count=0

echo "🚀 Starting deployment of $total projects..."
echo ""

while IFS= read -r project; do
    count=$((count + 1))
    printf "[%3d/%3d] " "$count" "$total"
    
    if deploy_project "$project"; then
        success=$((success + 1))
    else
        failed=$((failed + 1))
    fi
    
    # Small delay to avoid rate limiting
    sleep 0.5
done < "$PROJECTS_FILE"

echo ""
echo "════════════════════════════════════════"
echo "✅ Successful: $success"
echo "⚠️ Failed: $failed"
echo "📊 Total: $total"
echo "════════════════════════════════════════"
