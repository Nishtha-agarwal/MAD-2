const SummaryPro = {
  template: `
    <div>
      <h4>Service Request Counts by Status</h4>
      <canvas id="serviceRequestChart" width="100" height="25"></canvas>
    </div>
  `,
  data() {
    return {
      serviceRequestStatusCounts: null,
    };
  },

  async mounted() {
    try {
      const response = await fetch('/api/counts');
      if (response.ok) {
        const data = await response.json();
        console.log("Data fetched successfully:", data);

        this.serviceRequestStatusCounts = data.service_request_status_counts || {};
        
        this.renderChart();
      } else {
        console.error('Failed to fetch counts');
      }
    } catch (error) {
      console.error('Error fetching counts:', error);
    }
  },

  methods: {
    renderChart() {
      const ctx1 = document.getElementById('serviceRequestChart').getContext('2d');
      if (!ctx1) {
        console.error('Canvas element for serviceRequestChart not found!');
        return;
      }

      const statusLabels = ['Pending', 'Accepted', 'Completed', 'Rejected'];
      const statusData = statusLabels.map(
        (status) => this.serviceRequestStatusCounts[status] || 0
      );

      new Chart(ctx1, {
        type: 'bar',
        data: {
          labels: statusLabels,
          datasets: [
            {
              label: 'Service Requests',
              data: statusData,
              backgroundColor: ['#FFA726', '#66BB6A', '#29B6F6', 'red'],
              borderColor: ['#FB8C00', '#388E3C', '#0288D1'],
              borderWidth: 0.02,
            },
          ],
        },
        options: {
          responsive: true,
          plugins: {
            legend: {
              position: 'top',
            },
          },
        },
      });
    },
  },
};

export default SummaryPro;
