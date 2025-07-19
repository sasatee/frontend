import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Line, Bar, Pie } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

interface ChartProps {
  type: 'line' | 'bar' | 'pie';
  data: any;
  options?: any;
}

export function Chart({ type, data, options }: ChartProps) {
  const ChartComponent = {
    line: Line,
    bar: Bar,
    pie: Pie,
  }[type];

  return <ChartComponent data={data} options={options} />;
}
