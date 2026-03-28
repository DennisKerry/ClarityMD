from flask_sqlalchemy import SQLAlchemy


db = SQLAlchemy()


class Procedure(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    procedure = db.Column(db.String(200), nullable=False)
    joint = db.Column(db.String(100), nullable=False)
    body_area = db.Column(db.String(100))
    keywords = db.Column(db.Text)  # comma-separated
    pain_types = db.Column(db.Text)  # comma-separated
    product = db.Column(db.String(200))
    product_category = db.Column(db.String(100))
    technique = db.Column(db.Text)
    age_min = db.Column(db.Integer, default=14)
    age_max = db.Column(db.Integer, default=80)
    activity_level = db.Column(db.String(50))
    recovery_weeks = db.Column(db.Integer)
    contraindications = db.Column(db.Text)  # comma-separated
    arthrex_url = db.Column(db.String(500))
    full_text = db.Column(db.Text)

    def to_dict(self):
        return {
            "id": self.id,
            "procedure": self.procedure,
            "joint": self.joint,
            "body_area": self.body_area,
            "keywords": self.keywords,
            "pain_types": self.pain_types,
            "product": self.product,
            "product_category": self.product_category,
            "technique": self.technique,
            "age_min": self.age_min,
            "age_max": self.age_max,
            "activity_level": self.activity_level,
            "recovery_weeks": self.recovery_weeks,
            "contraindications": self.contraindications,
            "arthrex_url": self.arthrex_url,
            "full_text": self.full_text,
        }
