ARG PYTHON_VERSION=3.12

FROM python:${PYTHON_VERSION}-slim

LABEL description="FastAPI Backend"

ENV CONFIG__DB__URL=sqlite:///database.sqlite3

ENV CONFIG__ADMIN__APIKEY="None"

# The installer requires curl (and certificates) to download the release archive
RUN apt-get update && apt-get install -y --no-install-recommends curl ca-certificates

# Download the latest installer
ADD https://astral.sh/uv/install.sh /uv-installer.sh

# Run the installer then remove it
RUN sh /uv-installer.sh && rm /uv-installer.sh

# Ensure the installed binary is on the `PATH`
ENV PATH="/root/.local/bin/:$PATH"

WORKDIR /app/

COPY . .

RUN uv sync --locked
#    useradd --shell /bin/bash backend \
#    && chown -R backend:backend /app && \
#    chown -R backend:backend /home/backend/

ENV PATH="/app/.venv/bin:$PATH"

#USER backend

EXPOSE 8000

CMD ["uv", "run", "main.py"]
