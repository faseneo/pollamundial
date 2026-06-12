import ImportadorCSV from './ImportadorCSV'
import Mundial2026App from './Mundial2026App'

export default function App() {
  const importar = window.location.hash === "#importar";
  return importar ? <ImportadorCSV /> : <Mundial2026App />;
}