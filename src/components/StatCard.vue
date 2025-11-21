<<<<<<< HEAD
<template>
    <div class="stat-card" :class="{ highlight }">
        <div class="card-icon" v-if="icon">{{ icon }}</div>
        <div class="card-content">
            <div class="card-value">{{ value }}</div>
            <div class="card-label">{{ label }}</div>
        </div>
    </div>
</template>

<script setup lang="ts">
defineProps({
    icon: {
        type: String,
        default: ''
    },
    value: {
        type: [String, Number],
        required: true
    },
    label: {
        type: String,
        required: true
    },
    highlight: {
        type: Boolean,
        default: false
    }
})
</script>

<style scoped>
.stat-card {
    background: white;
    border-radius: 16px;
    padding: 24px;
    display: flex;
    align-items: center;
    gap: 16px;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
    transition: all 0.3s;
}

.stat-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
}

.stat-card.highlight {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.card-icon {
    font-size: 36px;
}

.highlight .card-icon {
    color: white;
}

.card-value {
    font-size: 28px;
    font-weight: 700;
    color: #667eea;
    margin-bottom: 4px;
}

.highlight .card-value {
    color: white;
}

.card-label {
    font-size: 13px;
    color: #666;
}

.highlight .card-label {
    color: rgba(255, 255, 255, 0.8);
}
</style>
=======
<template>
    <div class="stat-card" :class="{ highlight }">
        <div class="card-icon" v-if="icon">{{ icon }}</div>
        <div class="card-content">
            <div class="card-value">{{ value }}</div>
            <div class="card-label">{{ label }}</div>
        </div>
    </div>
</template>

<script setup lang="ts">
defineProps({
    icon: {
        type: String,
        default: ''
    },
    value: {
        type: [String, Number],
        required: true
    },
    label: {
        type: String,
        required: true
    },
    highlight: {
        type: Boolean,
        default: false
    }
})
</script>

<style scoped>
.stat-card {
    background: white;
    border-radius: 16px;
    padding: 24px;
    display: flex;
    align-items: center;
    gap: 16px;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
    transition: all 0.3s;
}

.stat-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
}

.stat-card.highlight {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.card-icon {
    font-size: 36px;
}

.highlight .card-icon {
    color: white;
}

.card-value {
    font-size: 28px;
    font-weight: 700;
    color: #667eea;
    margin-bottom: 4px;
}

.highlight .card-value {
    color: white;
}

.card-label {
    font-size: 13px;
    color: #666;
}

.highlight .card-label {
    color: rgba(255, 255, 255, 0.8);
}
</style>
>>>>>>> f465a0dd86651586e2c3629377edbabf79b9810b
