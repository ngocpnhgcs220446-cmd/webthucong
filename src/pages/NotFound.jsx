import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <section className="section">
      <div className="container empty-state">
        <h1>Page not found</h1>
        <p>The page you requested does not exist.</p>
        <Link className="btn" to="/">Back to homepage</Link>
      </div>
    </section>
  );
}
