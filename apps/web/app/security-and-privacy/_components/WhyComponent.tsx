import React from "react";

const WhyComponent = () => {
  return (
    <section className="border-t px-4 py-10 sm:px-6 lg:px-20">
      <div className="mx-auto grid max-w-5xl gap-8 md:grid-cols-2">
        <div className="space-y-3">
          <h2 className="text-xl font-bold tracking-tight">
            A least-access approach
          </h2>
          <p className="text-sm leading-6 text-muted-foreground">
            Public pull request and commit links can be processed without a
            GitHub App installation. Private repository access is optional and
            must be explicitly granted through GitHub. Installation tokens are
            created on the server when needed and are scoped to read repository
            contents, metadata, and pull requests. The app does not request
            permission to push code, merge changes, create branches, or modify
            repository settings.
          </p>
          <p className="text-sm leading-6 text-muted-foreground">
            Users can limit an installation to selected repositories and
            disconnect it from settings. Disconnecting removes the local
            installation record, and GitHub controls whether the external
            installation remains authorized.
          </p>
        </div>

        <div className="space-y-3">
          <h2 className="text-xl font-bold tracking-tight">
            Your role in protecting data
          </h2>
          <p className="text-sm leading-6 text-muted-foreground">
            Review organizational policy before submitting private code to any
            hosted or AI-assisted workflow. Repositories containing credentials,
            regulated information, customer data, unpublished security findings,
            or material restricted by contract should not be connected unless
            the appropriate owner has approved the processing path.
          </p>
          <p className="text-sm leading-6 text-muted-foreground">
            Never paste access tokens, API keys, passwords, webhook URLs, or
            other secrets into generation context or feedback forms. Review
            generated drafts before sharing because source-aware AI output can
            still omit context or reveal details that are inappropriate for a
            public audience.
          </p>
        </div>
      </div>

      <div className="mx-auto mt-8 max-w-5xl space-y-3 border-t pt-7">
        <h2 className="text-xl font-bold tracking-tight">
          Credentials, history, and connected services
        </h2>
        <p className="text-sm leading-6 text-muted-foreground">
          Saved AI provider keys and Discord webhook URLs are encrypted before
          database storage and are not returned to the browser in full. The
          application stores generation history and related source metadata so
          users can review, regenerate, or delete previous results. External
          providers still operate under their own security practices, retention
          rules, availability, and legal terms. Removing a local connection
          prevents future use by this service, but users may also need to revoke
          the corresponding integration or credential with the original
          provider.
        </p>
      </div>
    </section>
  );
};

export default WhyComponent;
