export default function StarRating({ rating }: {rating: number}) {
    const totalStars = 5;

    return (
        <div className="star-rating">
            {[...Array(totalStars)].map((_, i) => (
                <span key={i} className={i < rating ? "star filled" : "star"}>
                    ★
                </span>
            ))}
        </div>
    );
}
