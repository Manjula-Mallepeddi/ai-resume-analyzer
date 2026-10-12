"""Add analysis history

Revision ID: 725d91bfa37f
Revises: 2f762ff9d514
Create Date: 2026-09-11 08:54:37.067020

"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "725d91bfa37f"
down_revision: Union[str, Sequence[str], None] = "2f762ff9d514"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Create analyses table."""

    op.create_table(
        "analyses",

        sa.Column(
            "id",
            sa.Integer(),
            primary_key=True,
            nullable=False,
        ),

        sa.Column(
            "resume_id",
            sa.Integer(),
            sa.ForeignKey("resumes.id"),
            nullable=False,
        ),

        sa.Column(
            "job_description",
            sa.Text(),
            nullable=False,
        ),

        sa.Column(
            "ats_score",
            sa.Float(),
            nullable=False,
        ),

        sa.Column(
            "matched_skills",
            sa.JSON(),
            nullable=False,
        ),

        sa.Column(
            "missing_skills",
            sa.JSON(),
            nullable=False,
        ),

        sa.Column(
            "suggestions",
            sa.JSON(),
            nullable=False,
        ),

        sa.Column(
            "created_at",
            sa.DateTime(),
            nullable=False,
        ),
    )

    op.create_index(
        "ix_analyses_id",
        "analyses",
        ["id"],
        unique=False,
    )


def downgrade() -> None:
    """Remove analyses table."""

    op.drop_index(
        "ix_analyses_id",
        table_name="analyses",
    )

    op.drop_table("analyses")