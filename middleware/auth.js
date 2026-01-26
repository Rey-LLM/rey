import jwt from 'jsonwebtoken';

export const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Access token is missing' });
  }

  jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key', (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
};

export const authorizeRole = (roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'You do not have permission to perform this action' });
    }
    next();
  };
};

export const authorizeProjectAccess = async (Model) => {
  return async (req, res, next) => {
    try {
      const { projectId } = req.params;
      const project = await Model.findById(projectId);

      if (!project) {
        return res.status(404).json({ message: 'Project not found' });
      }

      const isMember = project.members.some(m => m.user.toString() === req.user.id) || 
                       project.owner.toString() === req.user.id;

      if (!isMember) {
        return res.status(403).json({ message: 'You do not have access to this project' });
      }

      req.project = project;
      next();
    } catch (err) {
      res.status(500).json({ message: 'Error checking project access' });
    }
  };
};
