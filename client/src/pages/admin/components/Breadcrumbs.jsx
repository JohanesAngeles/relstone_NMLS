import { useNavigate } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

const Breadcrumbs = ({ items }) => {
  const navigate = useNavigate();

  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 6,
      fontSize: 13, fontFamily: "'Poppins', sans-serif",
      marginBottom: 20,
    }}>
      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        return (
          <div key={index} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            {index > 0 && <ChevronRight size={14} color="#7FA8C4" />}
            {isLast ? (
              <span style={{ color: '#091925', fontWeight: 600 }}>
                {item.label}
              </span>
            ) : (
              <span
                onClick={() => item.path && navigate(item.path)}
                style={{
                  color: '#7FA8C4', fontWeight: 500,
                  cursor: item.path ? 'pointer' : 'default',
                  transition: 'color .15s',
                }}
                onMouseEnter={e => { if (item.path) e.target.style.color = '#2EABFE'; }}
                onMouseLeave={e => { if (item.path) e.target.style.color = '#7FA8C4'; }}
              >
                {item.label}
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default Breadcrumbs;