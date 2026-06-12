
CREATE OR REPLACE FUNCTION public.increment_click(link_id_param UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE public.links
  SET click_count = click_count + 1
  WHERE id = link_id_param;

  UPDATE public.profiles
  SET total_clicks = total_clicks + 1
  WHERE id = (SELECT profile_id FROM public.links WHERE id = link_id_param);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.increment_view(profile_id_param UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE public.profiles
  SET total_views = total_views + 1
  WHERE id = profile_id_param;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
