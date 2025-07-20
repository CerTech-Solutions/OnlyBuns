<template>
	<v-container class="py-6">
		<v-row justify="center" class="mb-6">
			<v-col cols="12" md="4">
				<v-select v-model="selectedPeriod" :items="['Weekly', 'Monthly', 'Yearly']" label="Period" dense
					outlined />
			</v-col>
		</v-row>

		<v-row justify="center" class="mb-6">
			<v-col cols="12" md="10">
				<v-card class="pa-4">
					<v-card-title class="text-h6">Post & Comments Trend</v-card-title>
					<v-card-text>
						<div class="text-center">
							<canvas id="lineChart"></canvas>
						</div>
					</v-card-text>
				</v-card>
			</v-col>
		</v-row>

		<v-row justify="center">
			<v-col cols="12" md="6">
				<v-card class="pa-4">
					<v-card-title class="text-h6">User Activity</v-card-title>
					<v-card-text>
						<div class="text-center">
							<canvas id="radialChart"></canvas>
						</div>
					</v-card-text>

				</v-card>
			</v-col>
		</v-row>
	</v-container>
</template>

<script>
import {
	Chart,
	LineElement,
	PointElement,
	LineController,
	BarElement,
	ArcElement,
	CategoryScale,
	LinearScale,
	Tooltip,
	Legend,
	DoughnutController
} from 'chart.js'

Chart.register(
	LineElement,
	PointElement,
	LineController,
	BarElement,
	ArcElement,
	CategoryScale,
	LinearScale,
	Tooltip,
	Legend,
	DoughnutController
)

import axiosInstance from '@/utils/axiosInstance'

export default {
	name: 'AdminAnalytics',
	data() {
		return {
			selectedPeriod: 'Weekly',
			chartLine: null,
			chartRadial: null,
			analytics: {
				timeline: [],
				users: {
					onlyPosts: 0,
					onlyComments: 0,
					neither: 0,
					total: 0
				}
			}
		}
	},
	watch: {
		selectedPeriod() {
			this.renderLineChart()
		}
	},
	mounted() {
		this.fetchAnalytics()
	},
	methods: {
		async fetchAnalytics() {
			try {
				const response = await axiosInstance.get('user/analytics')
				this.analytics = {
					timeline: response.data.posts.timeline,
					users: response.data.users
				}
				console.log('Analytics data:', this.analytics.timeline)
				this.renderLineChart()
				this.renderRadialChart()
			} catch (error) {
				console.error('Error fetching analytics:', error)
			}
		},

		renderLineChart() {
			this.$nextTick(() => {
				const canvas = document.getElementById('lineChart')
				if (!canvas) return
				const ctx = canvas.getContext('2d')
				const labels = this.getFormattedLabels()
				console.log('Labels for line chart:', labels)
				const filtered = this.getFilteredTimelineData(labels)
				if (this.chartLine) {
					this.chartLine.destroy()
					this.chartLine = null
				}
				this.chartLine = new Chart(ctx, {
					type: 'line',
					data: {
						labels,
						datasets: [
							{
								label: 'Posts',
								data: filtered.posts,
								borderColor: '#42A5F5',
								backgroundColor: '#42A5F5',
								tension: 0.3,
								fill: false
							},
							{
								label: 'Comments',
								data: filtered.comments,
								borderColor: '#66BB6A',
								backgroundColor: '#66BB6A',
								tension: 0.3,
								fill: false
							}
						]
					},
					options: {
						responsive: true,
						plugins: {
							legend: { position: 'top' }
						},
						scales: {
							y: {
								beginAtZero: true,
								ticks: { precision: 0 }
							}
						}
					}
				})
			})
		},

		getFormattedLabels() {
			const today = new Date()
			const period = this.selectedPeriod

			if (period === 'Weekly') {
				const labels = []
				const start = new Date(today)
				const day = start.getDay()
				const diff = day === 0 ? 6 : day - 1
				start.setDate(start.getDate() - diff)
				const dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
				for (let i = 0; i < 7; i++) {
					labels.push(dayNames[i])
				}
				return labels
			}

			if (period === 'Monthly') {
				const year = today.getFullYear()
				const month = today.getMonth()
				const daysInMonth = new Date(year, month + 1, 0).getDate()
				const labels = []
				for (let i = 1; i <= daysInMonth; i++) {
					const day = i.toString().padStart(2, '0')
					const m = (month + 1).toString().padStart(2, '0')
					labels.push(`${day}.${m}`)
				}
				return labels
			}

			if (period === 'Yearly') {
				return [
					'January', 'February', 'March', 'April', 'May', 'June',
					'July', 'August', 'September', 'October', 'November', 'December'
				]
			}

			return []
		},

		getFilteredTimelineData(labels) {
			const postsMap = new Map()
			const commentsMap = new Map()
			const period = this.selectedPeriod
			const today = new Date()
			const keyMap = new Map()

			if (period === 'Weekly') {
				const start = new Date(today)
				const day = start.getDay()
				const diff = day === 0 ? 6 : day - 1
				start.setDate(start.getDate() - diff)
				const dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
				for (let i = 0; i < 7; i++) {
					const d = new Date(start)
					d.setDate(start.getDate() + i)
					const fullDate = d.toISOString().split('T')[0]
					keyMap.set(dayNames[i], fullDate)
				}
			}

			if (period === 'Monthly') {
				const year = today.getFullYear()
				const month = today.getMonth()
				for (let i = 1; i <= 31; i++) {
					const date = new Date(year, month, i)
					if (date.getMonth() !== month) break
					const label = `${i.toString().padStart(2, '0')}.${(month + 1).toString().padStart(2, '0')}`
					const fullDate = date.toISOString().split('T')[0]
					keyMap.set(label, fullDate)
				}
			}

			if (period === 'Yearly') {
				const year = today.getFullYear()
				const monthNames = [
					'January', 'February', 'March', 'April', 'May', 'June',
					'July', 'August', 'September', 'October', 'November', 'December'
				]
				for (let i = 0; i < 12; i++) {
					const label = monthNames[i]
					const key = `${year}-${(i + 1).toString().padStart(2, '0')}`
					keyMap.set(label, key)
				}
			}

			this.analytics.timeline.forEach(entry => {
				const date = entry.date
				let key = date
				if (period === 'Yearly') {
					key = date.slice(0, 7)
				}

				postsMap.set(key, (postsMap.get(key) || 0) + entry.posts)
				commentsMap.set(key, (commentsMap.get(key) || 0) + entry.comments)
			})

			const posts = labels.map(label => {
				const dataKey = keyMap.get(label)
				return postsMap.get(dataKey) || 0
			})

			const comments = labels.map(label => {
				const dataKey = keyMap.get(label)
				return commentsMap.get(dataKey) || 0
			})

			return { posts, comments }
		}

		,

		renderRadialChart() {
			const ctx = document.getElementById('radialChart')
			const u = this.analytics.users
			console.log('User activity data:', u)
			const data = [
				((u.onlyPosts / u.total) * 100).toFixed(2),
				((u.onlyComments / u.total) * 100).toFixed(2),
				((u.neither / u.total) * 100).toFixed(2)
			]
			if (this.chartRadial) this.chartRadial.destroy()
			this.chartRadial = new Chart(ctx, {
				type: 'doughnut',
				data: {
					labels: ['Only Posts', 'Only Comments', 'No Activity'],
					datasets: [
						{
							data,
							backgroundColor: ['#42A5F5', '#66BB6A', '#EF5350']
						}
					]
				},
				options: {
					responsive: true,
					plugins: {
						legend: { position: 'bottom' }
					}
				}
			})
		}
	}
}
</script>

<style scoped>
canvas {
	max-width: 80%;
	margin: 0 auto;
	height: 300px !important;
	display: block;
}
</style>