const Home = () => {
  return (
    <section className="home-screen">
      <div className="home-hero">
        <div className="hero-badge">
          <span />
          Developer PR content assistant
        </div>
        <h1>
          Ship it. <span>Make noise.</span>
        </h1>
        <p>
          Drop a public GitHub PR or commit link. Generate summaries,
          changelogs, and dev-ready posts instantly.
        </p>
      </div>

      <div className="home-side">
        <div className="recent-header">
          <p className="screen-kicker">Recent generation</p>
        </div>

        <div className="recent-list">
          <article className="recent-card">
            <p>Pull Request - owner/repo</p>
            <h3>Add media attachments</h3>
            <span>Today, 4:20 PM</span>
          </article>

          <article className="recent-card">
            <p>Commit - owner/repo</p>
            <h3>Improve auth email code flow</h3>
            <span>Yesterday, 8:12 PM</span>
          </article>
        </div>
      </div>
    </section>
  );
};

export default Home;
