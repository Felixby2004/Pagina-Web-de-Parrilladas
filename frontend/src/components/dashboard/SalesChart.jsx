import { Card, CardContent, Typography } from '@mui/material';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export const SalesChart = ({ data, labels, loading = false }) => {
  if (loading) {
    return <Typography>Cargando gráfico...</Typography>;
  }

  const chartData = {
    labels: labels || ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'],
    datasets: [
      {
        label: 'Ingresos',
        data: data || [0, 0, 0, 0, 0, 0, 0],
        backgroundColor: 'rgba(139, 0, 0, 0.6)',
        borderColor: '#8B0000',
        borderWidth: 2,
        borderRadius: 4,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          font: { weight: 'bold' },
        },
      },
      title: {
        display: true,
        text: 'Ingresos de la Semana',
        font: { size: 16, weight: 'bold' },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: (value) => `S/ ${value}`,
        },
      },
    },
  };

  return (
    <Card sx={{ borderRadius: 2 }}>
      <CardContent sx={{ minHeight: { xs: 220, md: 300 }, py: 2 }}>
        <div style={{ width: '100%', height: '100%' }}>
          <Bar data={chartData} options={options} />
        </div>
      </CardContent>
    </Card>
  );
};