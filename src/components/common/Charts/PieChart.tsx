import React from 'react';
import { Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend
);

const PieChart = ({ data, options = {} }: any) => {
  const defaultOptions: any = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Pie Chart',
      },
    },
  };

  return (
    <div className="w-full h-full">
      <Pie data={data} options={{ ...defaultOptions, ...options }} />
    </div>
  );
};

export default PieChart; 