
import { useRef, useState, useCallback } from 'react';

export const useDraggableScroll = () => {
    const ref = useRef<HTMLDivElement>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [startX, setStartX] = useState(0);
    const [startY, setStartY] = useState(0);
    const [scrollLeft, setScrollLeft] = useState(0);
    const [scrollTop, setScrollTop] = useState(0);
    const [hasMoved, setHasMoved] = useState(false);

    const onMouseDown = useCallback((e: React.MouseEvent) => {
        if (!ref.current) return;
        // Support both left (0) and right (2) click
        if (e.button !== 0 && e.button !== 2) return;
        
        setIsDragging(true);
        setHasMoved(false);
        setStartX(e.pageX - ref.current.offsetLeft);
        setStartY(e.pageY - ref.current.offsetTop);
        setScrollLeft(ref.current.scrollLeft);
        setScrollTop(ref.current.scrollTop);
        
        document.body.style.userSelect = 'none';
    }, []);

    const onContextMenu = useCallback((e: React.MouseEvent) => {
        if (hasMoved) {
            e.preventDefault();
        }
    }, [hasMoved]);

    const onMouseUp = useCallback((e: React.MouseEvent) => {
        setIsDragging(false);
        document.body.style.userSelect = '';
        
        // If we moved significantly, prevent the click event from triggering
        if (hasMoved) {
            e.preventDefault();
            e.stopPropagation();
        }
    }, [hasMoved]);

    const onMouseMove = useCallback((e: React.MouseEvent) => {
        if (!isDragging || !ref.current) return;
        
        const x = e.pageX - ref.current.offsetLeft;
        const y = e.pageY - ref.current.offsetTop;
        const walkX = (x - startX) * 2;
        const walkY = (y - startY) * 2;
        
        if (Math.abs(x - startX) > 5 || Math.abs(y - startY) > 5) {
            setHasMoved(true);
            e.preventDefault();
            ref.current.scrollLeft = scrollLeft - walkX;
            ref.current.scrollTop = scrollTop - walkY;
        }
    }, [isDragging, startX, startY, scrollLeft, scrollTop]);

    const onMouseLeave = useCallback(() => {
        setIsDragging(false);
        document.body.style.userSelect = '';
    }, []);

    return {
        ref,
        onMouseDown,
        onMouseUp,
        onMouseMove,
        onMouseLeave,
        onContextMenu,
        isDragging
    };
};
